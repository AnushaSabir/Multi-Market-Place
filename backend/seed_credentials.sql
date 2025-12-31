/*
  IMPORTANT: Populate this file with the keys you provided.
  Runs this in Supabase SQL Editor to sets up your credentials.
*/

-- 1. Otto Credentials
INSERT INTO public.marketplace_credentials (marketplace, credentials)
VALUES (
  'otto',
  jsonb_build_object(
      'client_id', 'YOUR_OTTO_CLIENT_ID',
      'client_secret', 'YOUR_OTTO_CLIENT_SECRET',
      'access_token', '',  -- Will be generated automatically
      'refresh_token', '', -- Will be generated automatically
      'expires_at', 0
  )
) ON CONFLICT (marketplace) DO UPDATE 
SET credentials = EXCLUDED.credentials;

-- 2. eBay Credentials (Production)
INSERT INTO public.marketplace_credentials (marketplace, credentials)
VALUES (
  'ebay',
  jsonb_build_object(
      'client_id', 'YOUR_EBAY_CLIENT_ID',
      'client_secret', 'YOUR_EBAY_CLIENT_SECRET',
      'access_token', '', -- Will be generated automatically
      'expires_at', 0
  )
) ON CONFLICT (marketplace) DO UPDATE 
SET credentials = EXCLUDED.credentials;

-- 3. Kaufland Credentials
INSERT INTO public.marketplace_credentials (marketplace, credentials)
VALUES (
  'kaufland',
  jsonb_build_object(
      'client_key', 'YOUR_KAUFLAND_CLIENT_KEY',
      'secret_key', 'YOUR_KAUFLAND_SECRET_KEY',
      'user_agent', 'epicTec'
  )
) ON CONFLICT (marketplace) DO UPDATE 
SET credentials = EXCLUDED.credentials;

-- 4. Billbee Credentials (Optional: if you want to import from Billbee)
INSERT INTO public.marketplace_credentials (marketplace, credentials)
VALUES (
  'billbee',
  jsonb_build_object(
      'api_key', 'YOUR_BILLBEE_API_KEY',
      'username', 'YOUR_USERNAME',
      'password', 'YOUR_PASSWORD'
  )
) ON CONFLICT (marketplace) DO UPDATE 
SET credentials = EXCLUDED.credentials;

-- 5. Shopify Credentials (if needed)
INSERT INTO public.marketplace_credentials (marketplace, credentials)
VALUES (
  'shopify',
  jsonb_build_object(
      'access_token', 'YOUR_SHOPIFY_ADMIN_TOKEN',
      'shop_url', 'your-shop.myshopify.com'
  )
) ON CONFLICT (marketplace) DO UPDATE 
SET credentials = EXCLUDED.credentials;
