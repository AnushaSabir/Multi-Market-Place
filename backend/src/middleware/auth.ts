import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export const authenticateAPI = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({ error: 'Unauthorized: API Key missing' });
    }

    if (apiKey !== INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    next();
};
