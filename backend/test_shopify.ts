import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testShopify() {
    const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    console.log("-----------------------------------------");
    console.log("Testing Shopify Connection...");
    console.log(`Domain: ${shopDomain}`);
    console.log(`Token: ${accessToken ? (accessToken.substring(0, 10) + "...") : "MISSING"}`);
    console.log("-----------------------------------------");

    if (!shopDomain || !accessToken) {
        console.error("❌ MISSING CREDENTIALS in .env");
        return;
    }

    const url = `https://${shopDomain}/admin/api/2024-01/products.json?limit=1`;

    try {
        console.log(`Sending request to: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ SUCCESS!");
        console.log(`Status: ${response.status}`);
        console.log(`Found ${response.data.products.length} products.`);
        if (response.data.products.length > 0) {
            console.log(`First Product: ${response.data.products[0].title}`);
        }

    } catch (error: any) {
        console.error("❌ FAILED!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
    }
}

testShopify();
