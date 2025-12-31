import express from 'express';
import { crawlAmazonProduct } from '../crawler/amazon';

const router = express.Router();

// POST /api/crawler/amazon
// Body: { url: string } or { asin: string }
router.post('/amazon', async (req, res) => {
    try {
        const { url, asin } = req.body;
        const target = url || asin;

        if (!target) {
            return res.status(400).json({ error: 'Missing url or asin in request body' });
        }

        // Trigger the crawler
        // Note: Use a queue for production, but directly awaiting here for Phase 0 MVP
        const result = await crawlAmazonProduct(target);

        if (result.success) {
            return res.status(200).json({ message: 'Crawl successful', data: result.data });
        } else {
            return res.status(500).json({ error: 'Crawl failed', details: result.error });
        }

    } catch (error: any) {
        console.error('Crawler route error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

export default router;
