import express from 'express';
import { SyncService } from '../services/syncService';
import { ShopifyExporter } from '../services/exporters/shopifyExporter';
import { EbayExporter } from '../services/exporters/ebayExporter';
import { OttoExporter } from '../services/exporters/ottoExporter';
import { KauflandExporter } from '../services/exporters/kauflandExporter';

const router = express.Router();

// Webhook endpoint (Generic for MVP, in prod separate by provider)
// POST /api/webhooks/:marketplace
router.post('/:marketplace', async (req, res) => {
    const { marketplace } = req.params;
    const data = req.body;

    // Normalize payload based on marketplace (Mock logic)
    // Real implementation requires verifying HMAC signatures etc.
    let externalId = '';
    let newQuantity = -1;

    try {
        if (marketplace === 'shopify') {
            // Shopify payload mock
            externalId = data.id;
            newQuantity = data.inventory_quantity; // simplified
        } else if (marketplace === 'ebay') {
            // eBay notification payload mock
            externalId = data.Item.ItemID;
            newQuantity = data.Item.Quantity;
        }
        // ... others

        if (externalId && newQuantity >= 0) {
            await SyncService.handleIncomingStockUpdate(marketplace, String(externalId), newQuantity);
            return res.status(200).send('Webhook processed');
        }

        // If not stock update, maybe price or status? Ignored for MVP step 6 focus on "Stock sold"
        res.status(200).send('Ignored');

    } catch (e) {
        console.error("Webhook error:", e);
        res.status(500).send('Error');
    }
});

export default router;
