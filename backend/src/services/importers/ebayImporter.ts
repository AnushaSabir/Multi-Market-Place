import { BaseImporter, ImportedProduct } from './baseImporter';
import axios from 'axios';

export class EbayImporter extends BaseImporter {
    marketplace: 'ebay' = 'ebay';

    protected async fetchProductsFromApi(accessToken: string): Promise<ImportedProduct[]> {
        // Searching for 'iphone' as a test. TODO: Change 'iphone' to your seller username filter like `q=...&filter=sellers:{USERNAME}`
        console.log("Starting Unlimited Batch Import from eBay Browse API...");

        // Use a filter for specific Items. Using ' ' (space) as query to match all, filtered by seller.
        // User provided: epictec@outlook.de (Note: eBay API usually expects User ID, checking if email works or if this is the ID)
        let nextUrl: string | null = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=%20&filter=sellers:{epictec@outlook.de}&limit=50';
        let pageCount = 0;
        let totalSaved = 0;

        try {
            while (nextUrl) {
                console.log(`Fetching eBay page ${pageCount + 1}...`);
                // Explicitly type response as any to avoid circular type inference issues
                const response: any = await axios.get(nextUrl!, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                const items = response.data.itemSummaries || [];
                if (items.length === 0) {
                    console.log("No more items found.");
                    break;
                }

                // Map and Save immediately (Batch Processing)
                const pageProducts: ImportedProduct[] = items.map((item: any) => ({
                    title: item.title || 'Unknown eBay Item',
                    description: item.shortDescription || '',
                    sku: item.legacyItemId || item.itemId,
                    ean: item.gtin || '',
                    price: parseFloat(item.price?.value || '0'),
                    quantity: 1,
                    weight: 0,
                    images: item.image ? [item.image.imageUrl] : [],
                    external_id: item.itemId,
                    marketplace: 'ebay'
                }));

                for (const product of pageProducts) {
                    try {
                        await this.upsertProduct(product);
                        totalSaved++;
                    } catch (err: any) {
                        console.error(`Failed to save item ${product.sku}:`, err.message);
                    }
                }

                console.log(`Page ${pageCount + 1} done. Total saved so far: ${totalSaved}`);

                // Pagination
                const nextLink = response.data.next;
                nextUrl = nextLink ? nextLink : null;

                pageCount++;
            }
        } catch (error: any) {
            console.error("eBay Fetch Critical Error:", error.response?.data || error.message);
            // We don't return partials here because we already upserted them batch by batch.
            // Just throw is fine or suppress if we want to count it as partial success.
            if (totalSaved === 0) throw error;
        }

        console.log(`eBay Import Finished. Total successfully imported: ${totalSaved}`);
        // Return empty array because we already upserted everything locally
        return [];
    }
}
