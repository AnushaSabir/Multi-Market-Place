
const { createClient } = require('../backend/node_modules/@supabase/supabase-js');
const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLink() {
    console.log("Testing Link Insertion (JS)...");

    // 1. Create Prod
    const { data: prod, error: pErr } = await supabase.from('products').insert({
        title: 'Debug JS Product',
        sku: 'DEBUG-JS-001',
        status: 'imported'
    }).select().single();

    if (pErr) {
        console.error("Product Insert Failed:", pErr);
        return;
    }
    console.log(`Product Created: ${prod.id}`);

    // 2. Create Link
    const { data: link, error: lErr } = await supabase.from('marketplace_products').insert({
        product_id: prod.id,
        marketplace: 'shopify',
        external_id: '888888',
        sync_status: 'synced',
        last_synced_at: new Date().toISOString()
    }).select().single();

    if (lErr) {
        console.error("Link Insert Failed:", lErr);
    } else {
        console.log("Link Insert Success. Marketplace:", link.marketplace);
    }

    // 3. Cleanup
    await supabase.from('products').delete().eq('id', prod.id);
    console.log("Cleanup Done.");
}

testLink();
