import { BaseExporter, ExportResult } from './baseExporter';

export class OttoExporter extends BaseExporter {
    marketplace: 'otto' = 'otto';

    protected async createListingOnApi(accessToken: string, product: any): Promise<ExportResult> {
        console.log(`[Otto] Creating listing: ${product.title}`);
        return {
            success: true,
            external_id: `OTTO-SKU-${Math.floor(Math.random() * 10000)}`
        };
    }

    protected async updateListingOnApi(accessToken: string, externalId: string, updates: any): Promise<ExportResult> {
        console.log(`[Otto] Updating listing ${externalId}:`, updates);

        try {
            const axios = (await import('axios')).default;
            const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

            // Otto typically uses 'Pricing' and 'Quantity' endpoints separated involved with Position Item ID or SKU
            // API: https://api.otto.market/v1/products/{sku}/pricing
            // API: https://api.otto.market/v1/products/{sku}/quantity

            // We assume externalId is the SKU based on our Importer logic, or we rely on updates.sku
            const sku = updates.sku || externalId;

            const promises = [];

            // Ensure SKU is URL encoded to handle spaces/special chars
            const safeSku = encodeURIComponent(sku);

            if (updates.price) {
                // Pricing: Try V2 standard endpoint
                const priceUrl = `https://api.otto.market/v2/products/${safeSku}/pricing`;
                console.log(`[Otto] Posting Price to: ${priceUrl}`);
                promises.push(axios.post(priceUrl, {
                    standardPrice: {
                        amount: updates.price,
                        currency: "EUR"
                    }
                }, { headers }));
            }

            if (updates.quantity !== undefined) {
                // Quantity: MUST use Availability V1 API (Batch format)
                const qtyUrl = `https://api.otto.market/v1/availability/quantities`;
                console.log(`[Otto] Posting Quantity to: ${qtyUrl}`);
                promises.push(axios.post(qtyUrl, [
                    {
                        sku: sku, // Send raw SKU (not encoded) in body, as it matches partnerSku
                        quantity: updates.quantity
                    }
                ], { headers }));
            }

            await Promise.all(promises);
            return { success: true };

        } catch (error: any) {
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.error(`[Otto] Update Failed for SKU '${externalId}': ${errorMsg}`);
            return { success: false, error: errorMsg };
        }
    }
}
