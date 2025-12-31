import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
    static async optimizeProductListing(title: string, description: string): Promise<{ title: string; description: string }> {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is missing in .env");
        }

        try {
            console.log("Creating AI optimization request for Germany...");
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert E-commerce SEO Copywriter for the German market (Germany). 
                        Your task is to take a product title and description (which might be in English or German) and:
                        1. Translate it to professional, native-level German (if not already).
                        2. Optimize the TITLE for high click-through rate and search visibility on marketplaces like Kaufland, Otto, and Amazon.de. Include key specs. Max 150 chars.
                        3. Optimize the DESCRIPTION to be persuasive, easy to read (bullet points if suitable), and SEO-rich.
                        
                        Return ONLY a valid JSON object with the following format:
                        {
                            "title": "Optimized German Title",
                            "description": "Optimized German Description HTML or Text"
                        }`
                    },
                    {
                        role: "user",
                        content: `Original Title: ${title}\nOriginal Description: ${description}`
                    }
                ],
                model: "gpt-3.5-turbo", // Cost effective and fast. Use gpt-4 for better results if user wants.
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("Received empty response from OpenAI");

            const parsed = JSON.parse(content);
            return {
                title: parsed.title,
                description: parsed.description
            };

        } catch (error: any) {
            console.error("OpenAI Error:", error.message);
            throw new Error(`AI Optimization Failed: ${error.message}`);
        }
    }
}
