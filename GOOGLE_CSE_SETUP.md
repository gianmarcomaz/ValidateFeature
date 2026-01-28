# Serper.dev Search Integration Guide

## Problem Analysis

The competitor analysis feature relies on external search data to find similar products and markets. It is now powered by **Serper.dev** instead of Google Custom Search (CSE).

If `SERPER_API_KEY` is missing or invalid, the app will:
- Return empty or partial evidence
- Show warnings in the Evidence Metrics panel
- Potentially under-report competitors or market saturation

## Step-by-Step Setup Instructions (Serper.dev)

### Step 1: Create Serper.dev Account & API Key

1. Go to [Serper.dev](https://serper.dev)
2. Sign up or log in
3. Create an API key from the dashboard
4. Copy the API key (you can rotate/regenerate it later if needed)

### Step 2: Add Environment Variable

1. In your project root directory, create or edit `.env.local`
2. Add this line:

```env
SERPER_API_KEY=your_serper_api_key_here
```

**Important Notes**:
- Replace `your_serper_api_key_here` with your actual Serper.dev API key
- Do NOT add quotes around the value
- Do NOT commit `.env.local` to Git (it's already in `.gitignore`)

### Step 6: Restart Development Server

1. **Stop** your current dev server (Ctrl+C in terminal)
2. **Start** it again:
   ```bash
   npm run dev
   ```

**Why restart?** Next.js only reads `.env.local` on server startup.

### Step 7: Verify Integration

#### Option A: Test Endpoint (Easiest)

1. Open browser and go to: `http://localhost:3000/api/test-evidence`
2. You should see:
   ```json
   {
     "googleCse": {
       "configured": true,
       "status": "success",
       "results": [...],
       "message": "Found X items"
     }
   }
   ```

#### Option B: Test Full Flow

1. Go to `/new` page
2. Submit a test feature (e.g., "Resume parsing and ATS optimization tool")
3. Check browser console for logs:
   - Should see: `[Evidence] googleConfigured=true`
   - Should see: `[Evidence] competitors=X` (where X > 0)
4. On results page (`/s/[id]`):
   - **Competitor Analysis** section should appear
   - Should show 1-5 competitors with names, categories, and links
   - Evidence Metrics should show competitor count > 0

#### Option C: Check Server Logs

In your terminal where `npm run dev` is running, you should see:
```
[Evidence] googleConfigured=true, googleItems=X, hnHits=Y, competitors=Z
```

If you see `googleConfigured=false`, the environment variables are not being read.

## Troubleshooting

### Issue: "Google CSE not configured" warning still appears

**Solutions**:
1. ✅ Verify `.env.local` exists in project root (not in a subdirectory)
2. ✅ Verify variable names are EXACTLY: `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX` (case-sensitive)
3. ✅ Verify no quotes around values in `.env.local`
4. ✅ Restart dev server after adding variables
5. ✅ Check terminal logs - if you see `googleConfigured=false`, env vars aren't loading

### Issue: API returns 403 Forbidden

**Solutions**:
1. ✅ Verify API key is restricted to "Custom Search API" only
2. ✅ Verify Custom Search API is enabled in Google Cloud Console
3. ✅ Check API key hasn't been deleted or regenerated
4. ✅ Wait 5-10 minutes after creating key (propagation delay)

### Issue: API returns 429 Rate Limit

**Solutions**:
1. ✅ Google CSE free tier: 100 queries/day
2. ✅ Wait 24 hours for quota reset
3. ✅ Consider upgrading to paid tier if needed

### Issue: No competitors found even with API configured

**Solutions**:
1. ✅ Check server logs: `[Evidence] competitors=X` - if X is 0, search queries may be too specific
2. ✅ Try a different feature description with more common keywords
3. ✅ Check that search queries are being generated (see logs: `[Evidence] googleItems=X`)
4. ✅ Competitor extraction requires product/service domains - generic articles won't be extracted

### Issue: Environment variables not loading

**Solutions**:
1. ✅ Ensure file is named `.env.local` (not `.env` or `.env.example`)
2. ✅ Ensure file is in project root (same directory as `package.json`)
3. ✅ Restart dev server completely (stop and start)
4. ✅ Check for typos in variable names
5. ✅ Verify no extra spaces or special characters

## Verification Checklist

After setup, verify:

- [ ] `.env.local` file exists with both `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX`
- [ ] `/api/test-evidence` shows `googleCse.configured: true`
- [ ] `/api/test-evidence` shows `googleCse.status: "success"`
- [ ] Server logs show `googleConfigured=true`
- [ ] Submitting a feature shows competitors in console logs
- [ ] Results page shows "Competitor Analysis" section
- [ ] Competitor Analysis shows at least 1 competitor with link

## Cost Information

- **Free Tier**: 100 search queries per day
- **Paid Tier**: $5 per 1,000 queries (after free tier)
- **Typical Usage**: Each feature submission uses 6-10 queries
- **Daily Limit**: ~10-15 feature submissions per day on free tier

## Security Best Practices

1. ✅ **Restrict API Key**: Only allow "Custom Search API" (done in Step 3)
2. ✅ **Never commit `.env.local`**: Already in `.gitignore`
3. ✅ **Use different keys for dev/prod**: Create separate keys for production
4. ✅ **Monitor usage**: Check Google Cloud Console → APIs & Services → Dashboard

## Next Steps After Setup

Once Google CSE is configured:

1. **Test with a real feature**: Submit a feature and verify competitor analysis appears
2. **Check evidence quality**: Verify competitors are relevant and links work
3. **Monitor quota**: Check Google Cloud Console for daily usage
4. **Production setup**: When deploying, add same env vars to your hosting platform (Vercel, etc.)

## Additional Resources

- [Google Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Programmable Search Engine Setup](https://developers.google.com/custom-search/docs/tutorial/creatingcse)
- [API Quotas and Limits](https://developers.google.com/custom-search/v1/overview#pricing)

---

**Need Help?** Check the server logs and browser console for specific error messages.

