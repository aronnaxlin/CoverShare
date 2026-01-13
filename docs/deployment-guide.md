# Vercel Deployment Guide

This guide will help you deploy the CoverShare API service to Vercel for iOS Shortcuts integration.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Your CoverShare repository pushed to GitHub

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

## Step 2: Import Your Project

1. Click "Add New..." → "Project"
2. Select your `CoverShare` repository from the list
3. Click "Import"

## Step 3: Configure Project Settings

Vercel will auto-detect the project. Configure as follows:

- **Framework Preset**: Other
- **Root Directory**: `./` (default)
- **Build Command**: Leave empty or use `npm install`
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

> [!IMPORTANT]
> No build step is needed since this is a serverless API project.

## Step 4: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes for deployment to complete
3. You'll see a success message with your deployment URL

Your API will be available at:
```
https://your-project-name.vercel.app/api/generate
```

## Step 5: Test Your API

Use `curl` to test:

```bash
curl -X POST https://your-project-name.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Lover Taylor Swift",
    "style": "both"
  }'
```

You should receive a JSON response with base64-encoded images.

## Step 6: Note Your API URL

Copy your API URL for use in iOS Shortcuts:
```
https://your-project-name.vercel.app/api/generate
```

## Troubleshooting

### Deployment Fails

- Check that all dependencies are listed in `package.json`
- Ensure `api/generate.js` file exists
- Check Vercel function logs in the dashboard

### Function Timeout

- Vercel free tier has 10-second limit
- Image generation typically takes 3-5 seconds
- If it times out, the album artwork may be too large

### CORS Errors

- Ensure `vercel.json` has proper CORS headers
- Check that requests include `Content-Type: application/json`

## Updating Your Deployment

Every time you push to your GitHub repository's main branch, Vercel will automatically redeploy.

To manually redeploy:
1. Go to Vercel dashboard
2. Select your project
3. Click "Redeploy"

## Environment Variables (Optional)

If you want to restrict API access, you can add an API key:

1. Go to Project Settings → Environment Variables
2. Add `API_KEY` with a secret value
3. Update `api/generate.js` to check the header

## Next Steps

Once deployed, proceed to [iOS Shortcut Guide](./ios-shortcut-guide.md) to set up your iPhone.
