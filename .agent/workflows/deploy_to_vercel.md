---
description: How to deploy the application to Vercel using Git
---

# Deploying to Vercel

Follow these steps to deploy your application to Vercel.

## Prerequisites
- A GitHub, GitLab, or Bitbucket account.
- A Vercel account (free tier is fine).

## Step 1: Push Code to Git
1.  Initialize Git in your project folder (if not done):
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    ```
2.  Create a new repository on GitHub (or your preferred provider).
3.  Link your local folder to the remote repository:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy on Vercel
1.  Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your Git repository from the list and click **Import**.

## Step 3: Configure Environment Variables
**CRITICAL:** You must add your Supabase credentials here for the app to work.
1.  In the "Configure Project" screen, find the **Environment Variables** section.
2.  Add the following variables (copy values from your local `.env` file):
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `NEXT_PUBLIC_SUPABASE_URL` (if used in frontend)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if used in frontend)
    - `NODE_ENV`: set to `production`

## Step 4: Build Settings (Optional)
- Vercel usually detects Next.js automatically.
- Framework Preset: `Next.js`
- Build Command: `next build` (default)
- Output Directory: `.next` (default)

## Step 5: Deploy
1.  Click **Deploy**.
2.  Wait for the build to complete.
3.  Once finished, you will get a live URL (e.g., `https://your-project.vercel.app`).
