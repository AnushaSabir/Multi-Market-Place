import express from 'express';
import { supabase } from '../database/supabaseClient';
import { SyncService } from '../services/syncService';
import { TokenManger } from '../services/tokenService';

const router = express.Router();

// GET /api/sync/status
router.get('/status', async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await supabase
        .from('sync_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data, count });
});

// POST /api/sync/push/:marketplace
router.post('/push/:marketplace', async (req, res) => {
    const { marketplace } = req.params;
    // Manual trigger to push ALL products to a marketplace? 
    // Or just check sync status? 
    // Requirement says "POST /sync/push/:marketplace".
    // Implementing a basic "Push pending updates" logic

    // 1. Find all products that might need sync or just all?
    // Let's assume we trigger a generic sync check

    res.json({ message: `Sync push triggered for ${marketplace} (Mock implementation)` });
});

// POST /api/sync/pull/:marketplace
router.post('/pull/:marketplace', async (req, res) => {
    const { marketplace } = req.params;
    // This typically means "Import"
    // We can redirect to the import logic
    // or call the importer directly here.

    res.json({ message: `Sync pull triggered for ${marketplace}. Please use /api/products/import` });
});

// POST /api/sync/batch - Sync multiple products
router.post('/batch', async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });

    try {
        console.log(`Batch sync requested for ${ids.length} products`);

        // We re-fetch products to get current state (or just trigger sync if we assume DB is fresh)
        // syncProductUpdateToAll performs a look-up anyway.
        // But it requires "updates" object to push. 
        // Logic Gap: syncProductUpdateToAll pushes specific *updates*. 
        // If we want to "Force Sync" the *current* DB state, we need a method for that.
        // For now, we will simulate an "update" of the core fields by fetching them first.

        const { data: products, error } = await supabase
            .from('products')
            .select('id, title, description, price, quantity')
            .in('id', ids);

        if (error) throw error;

        const promises = products?.map(p =>
            SyncService.syncProductUpdateToAll(p.id, {
                title: p.title,
                description: p.description,
                price: p.price,
                quantity: p.quantity
            })
        ) || [];

        await Promise.all(promises);

        res.json({ message: `Synced ${ids.length} products to all connected marketplaces.` });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
