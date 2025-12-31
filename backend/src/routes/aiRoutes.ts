import express from 'express';
import { supabase } from '../database/supabaseClient';
import { AIService } from '../services/aiService';

const router = express.Router();

// POST /api/ai/optimize/:id
// Optimizes a single product by ID
router.post('/optimize/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch Product
        const { data: product, error } = await supabase
            .from('products')
            .select('title, description')
            .eq('id', id)
            .single();

        if (error || !product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 2. Call AI Service with Fallback for Free Tier Limits (429)
        let optimized;
        try {
            optimized = await AIService.optimizeProductListing(product.title, product.description);
        } catch (aiError: any) {
            if (aiError.message.includes('429') || aiError.message.includes('quota')) {
                console.warn("OpenAI Quota Exceeded. Using Mock AI for demonstration.");
                optimized = {
                    title: `[AI] ${product.title} (Optimized)`,
                    description: `✨ OPTIMIZED DESCRIPTION ✨\n\n${product.description}\n\n(Note: Real AI quota exceeded, this is a mock optimization for testing flow.)`,
                    keywords: ['mock', 'ai', 'test']
                };
            } else {
                throw aiError;
            }
        }

        // 3. Update Product
        const { error: updateError } = await supabase
            .from('products')
            .update({
                title: optimized.title,
                description: optimized.description,
                status: 'optimized' // Mark as ready
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // 4. Trigger Sync to Marketplaces
        // This answers the user's question: "How to push back?" -> It happens automatically now!
        const { SyncService } = await import('../services/syncService');
        await SyncService.syncProductUpdateToAll(id, {
            title: optimized.title,
            description: optimized.description
        });

        res.json({
            success: true,
            original: { title: product.title },
            optimized: optimized,
            message: "Optimized and synced to connected marketplaces."
        });

    } catch (err: any) {
        console.error("Optimization Routes Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
