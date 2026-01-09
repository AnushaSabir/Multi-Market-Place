
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testLink() {
    console.log("Testing Manufacturer Link Insertion...");

    // 1. Create Dummy Product
    const { data: prod, error: pErr } = await supabase.from('products').insert({
        title: 'Debug Product Shopify',
        sku: 'DEBUG-SHOPIFY-001',
        status: 'imported'
    }).select().single();

    if (pErr) {
        console.error("Product Insert Failed:", pErr);
        return;
    }
    console.log(`Created Debug Product: ${prod.id}`);

    // 2. Create Link
    const { data: link, error: lErr } = await supabase.from('marketplace_products').insert({
        product_id: prod.id,
        marketplace: 'shopify',
        external_id: '99999999',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
    }).select().single();

    if (lErr) {
        console.error("Link Insert Failed:", lErr);
    } else {
        console.log("Link Insert Success:", link);
    }

    // 3. Cleanup
    await supabase.from('products').delete().eq('id', prod.id);
    console.log("Cleanup Done.");
}

testLink();
