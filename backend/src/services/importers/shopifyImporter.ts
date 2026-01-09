import { BaseImporter, ImportedProduct } from './baseImporter';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export class ShopifyImporter extends BaseImporter {
    marketplace: 'shopify' = 'shopify';

    protected async fetchProductsFromApi(accessToken: string): Promise<ImportedProduct[]> {
        const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
        if (!shopDomain) throw new Error("SHOPIFY_SHOP_DOMAIN not set");

        // DEBUG: Log loaded credentials to verify env loading
        console.log(`[ShopifyImporter] Domain from env: '${shopDomain}'`);
        console.log(`[ShopifyImporter] Token length: ${accessToken ? accessToken.length : 0}`);

        console.log(`Fetching Shopify products from ${shopDomain}...`);

        let allProducts: ImportedProduct[] = [];
        let url = `https://${shopDomain}/admin/api/2024-01/products.json?limit=250`; // Max limit
        let page = 1;

        console.log(`[ShopifyImporter] Starting import with page size 250...`);

        try {
            while (url) {
                // Check stop signal from BaseImporter
                if (BaseImporter.stopImport) {
                    console.log("Shopify import stopped by user.");
                    break;
                }

                console.log(`[ShopifyImporter] Fetching page ${page}... (Accumulated: ${allProducts.length})`);
                const response = await axios.get(url, {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json'
                    }
                });

                const products = response.data.products;

                for (const p of products) {
                    // Map Shopify product to our format
                    // Handle variants: if multiple variants, we might create multiple products or just the main one.
                    // For MVP simplicity, let's take the first variant's inventory and price, but aggregate images.

                    const firstVariant = p.variants[0] || {};
                    const imageUrls = p.images?.map((img: any) => img.src) || [];

                    allProducts.push({
                        title: p.title,
                        description: p.body_html?.replace(/<[^>]*>?/gm, "") || "", // Strip HTML
                        sku: firstVariant.sku || `SHOPIFY-${p.id}`,
                        ean: firstVariant.barcode || "", // EAN often in barcode field
                        price: parseFloat(firstVariant.price || "0"),
                        quantity: firstVariant.inventory_quantity || 0,
                        images: imageUrls,
                        external_id: String(p.id),
                        marketplace: 'shopify'
                    });
                }

                page++;

                // Pagination (Link header)
                const linkHeader = response.headers['link'];
                if (linkHeader && linkHeader.includes('rel="next"')) {
                    // parse next link - simplistic approach
                    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                    url = match ? match[1] : "";
                } else {
                    url = "";
                }
            }
        } catch (error: any) {
            console.error("Shopify Import Error:", error.response?.data || error.message);
            throw new Error(`Shopify API failed: ${error.message}`);
        }

        if (allProducts.length === 0) {
            console.error("[ShopifyImporter] No products fetched.");
            throw new Error("Zero products found. Verify your 'Shop Domain' and 'Access Token' in settings/env.");
        }
        return allProducts;
    }
}
