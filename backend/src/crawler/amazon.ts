// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { supabase } from '../database/supabaseClient';

// puppeteer.use(StealthPlugin()); // Moved inside function

export interface ScrapedProduct {
    title: string;
    price: string;
    description: string;
    bullets: string[];
    images: string[];
    category: string;
    brand: string;
    asin: string;
}

export async function crawlAmazonProduct(urlOrAsin: string): Promise<{ success: boolean; data?: ScrapedProduct; error?: string }> {
    // VERCEL CHECK: If running on Vercel properly, Puppeteer is hard.
    // For now, we wrap in try/catch dynamic import to prevent app crash at startup.
    let puppeteer, StealthPlugin;
    try {
        puppeteer = (await import('puppeteer-extra')).default;
        StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
        puppeteer.use(StealthPlugin());
    } catch (e) {
        console.error("Puppeteer libraries missing or failed to load:", e);
        return { success: false, error: "Crawler not supported in this environment (Vercel Serverless)." };
    }

    let url = urlOrAsin;
    let asin = '';

    // Simple ASIN detection (if input is just ASIN, construct URL)
    if (!urlOrAsin.startsWith('http')) {
        asin = urlOrAsin;
        url = `https://www.amazon.de/dp/${asin}`; // Defaulting to .de as marketplaces mentioned (Otto/Kaufland) are German markets usually.
    } else {
        // Attempt to extract ASIN from URL
        const match = url.match(/\/dp\/([A-Z0-9]{10})/);
        if (match) {
            asin = match[1];
        } else {
            // Fallback or other patterns like /gp/product/
            const matchGp = url.match(/\/gp\/product\/([A-Z0-9]{10})/);
            if (matchGp) asin = matchGp[1];
        }
    }

    // Log attempt
    console.log(`Starting crawl for ${url} (ASIN: ${asin})`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set viewport and user agent to look like a real user
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Check for captcha (very basic check)
        const titleSelector = '#productTitle';
        try {
            await page.waitForSelector(titleSelector, { timeout: 10000 });
        } catch (e) {
            // Only return here if we really can't find the product based on title presence
            const bodyText = await page.evaluate(() => document.body.innerText);
            if (bodyText.includes("Enter the characters you see below")) {
                throw new Error("Bot detection triggered (CAPTCHA).");
            }
            throw new Error("Product title not found. Page might vary or be blocked.");
        }

        // Extract Data
        const data = await page.evaluate(() => {
            const getText = (sel: string) => document.querySelector(sel)?.textContent?.trim() || '';
            const getAttr = (sel: string, attr: string) => document.querySelector(sel)?.getAttribute(attr) || '';
            const getList = (sel: string) => Array.from(document.querySelectorAll(sel)).map(el => el.textContent?.trim() || '').filter(t => t);

            const title = getText('#productTitle');
            const price = getText('.a-price .a-offscreen') || getText('#price_inside_buybox') || getText('#priceblock_ourprice');
            const brand = getText('#bylineInfo') || getText('.po-brand .a-span9'); // "Visit the X Store" or table row

            // Bullets
            const bullets = getList('#feature-bullets ul li span.a-list-item');

            // Description
            const description = getText('#productDescription') || getText('#aplus');

            // Images 
            const mainImg = getAttr('#landingImage', 'data-old-hires') || getAttr('#landingImage', 'src');
            const images = mainImg ? [mainImg] : [];
            // Attempt to find more images from thumbnails
            const thumbImgs = Array.from(document.querySelectorAll('#altImages ul li.item img')).map(img => {
                const src = img.getAttribute('src');
                // Hack to get higher res from thumbnail url typically: remove partial resolution suffixes
                if (src) {
                    // e.g. https://m.media-amazon.com/images/I/41-abc._AC_US40_.jpg -> remove ._AC_US40_
                    return src.replace(/\._AC_.*?\./, '.');
                }
                return '';
            }).filter(s => s);

            if (thumbImgs.length > 0) images.push(...thumbImgs);

            // Remove duplicates
            const uniqueImages = [...new Set(images)];

            // Category (Breadcrumbs)
            const category = getText('#wayfinding-breadcrumbs_feature_div ul') || '';

            return {
                title,
                price,
                brand,
                bullets,
                description,
                images: uniqueImages,
                category
            };
        });

        const scrapedData: ScrapedProduct = {
            ...data,
            asin: asin || ''
        };

        // Save to Amazon Products Table in Supabase
        if (asin) {
            const { error } = await supabase
                .from('amazon_products')
                .upsert({
                    asin: asin,
                    raw_data: scrapedData,
                    crawl_status: 'success',
                    extracted_at: new Date().toISOString()
                }, { onConflict: 'asin' });

            if (error) console.error('Error saving to amazon_products:', error);

            // Also Create product entry in products table as requested in "PROCESS: Create product entry in products table"
            // We map extracted fields to the products schema
            // Normalize price: remove currency symbols and convert to float (simple heuristic)
            const priceNum = parseFloat(scrapedData.price.replace(/[^0-9,.]/g, '').replace(',', '.')); // Handle German comma

            const { error: prodError } = await supabase
                .from('products')
                .insert({
                    title: scrapedData.title,
                    description: scrapedData.description,
                    price: isNaN(priceNum) ? 0 : priceNum,
                    images: scrapedData.images,
                    status: 'imported', // "Mark status as scraped" -> status (imported | optimized | published) -> 'imported' seems best fit
                    // other fields like sku, ean might be missing or need further parsing
                });

            if (prodError) console.error('Error creating product entry:', prodError);
        }

        await browser.close();
        return { success: true, data: scrapedData };

    } catch (error: any) {
        console.error(`Crawl failed for ${url}:`, error.message);
        if (browser) await browser.close();

        // Log failure
        if (asin) {
            await supabase
                .from('amazon_products')
                .upsert({
                    asin: asin,
                    crawl_status: 'failed',
                    error_message: error.message,
                    extracted_at: new Date().toISOString()
                }, { onConflict: 'asin' });
        }

        return { success: false, error: error.message };
    }
}
