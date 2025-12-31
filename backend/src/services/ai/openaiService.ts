import OpenAI from 'openai';
import { supabase } from '../../database/supabaseClient';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface OptimizedContent {
    title: string;
    description: string;
    seo_keywords: string[];
    german_translation?: {
        title: string;
        description: string;
    };
}

export async function optimizeProduct(productId: string): Promise<{ success: boolean; data?: OptimizedContent; error?: string }> {
    try {
        // 1. Fetch Product
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error || !product) throw new Error('Product not found');

        // 2. Prepare Prompt
        const prompt = `
      You are an ecommerce SEO expert. Analyze and optimize the following product data.
      Return strictly a JSON object with the following structure:
      {
        "title": "Optimized Title (max 150 chars, include keywords, persuasive)",
        "description": "Optimized Description (HTML format, bullet points for features, SEO improved)",
        "seo_keywords": ["keyword1", "keyword2", "keyword3"],
        "german_translation": {
            "title": "German title",
            "description": "German description"
        }
      }

      Input Data:
      Title: ${product.title}
      Description: ${product.description}
      Category/Keywords: ${product.sku || ''}
    `;

        // 3. Call OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // or gpt-3.5-turbo if cost is issue, gpt-4o preferred for multilingual
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");

        const optimizedData: OptimizedContent = JSON.parse(content);

        // 4. Update Product in DB
        // We update the main fields? Or store optimized strings separately?
        // Requirement says "Optimizes Title, Description". 
        // We update status to 'optimized'.

        const { error: updateError } = await supabase
            .from('products')
            .update({
                title: optimizedData.title, // Overwriting original? Or user choice? Assuming overwrite for "Optimization" phase
                description: optimizedData.description,
                status: 'optimized'
                // We might want to store german metrics or keywords in a metadata column if existing schema permits,
                // or extend schema. For now we update core fields.
            })
            .eq('id', productId);

        if (updateError) throw new Error(updateError.message);

        return { success: true, data: optimizedData };

    } catch (err: any) {
        console.error("AI Optimization Failed:", err);
        return { success: false, error: err.message };
    }
}
