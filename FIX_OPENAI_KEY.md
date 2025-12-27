# Fix OpenAI API Key Error

## Quick Fix Steps

### 1. Verify .env.local File Location
- **Location:** Must be in the **project root** (same folder as `package.json`)
- **Filename:** Exactly `.env.local` (not `.env`, not `.env.local.txt`)

### 2. Check Key Format in .env.local
Your `.env.local` should look like this:

```env
OPENAI_API_KEY=sk-proj-...your-key-here...
```

**Common mistakes:**
- ❌ `OPENAI_API_KEY="sk-..."` (remove quotes)
- ❌ `OPENAI_API_KEY = sk-...` (remove spaces around =)
- ❌ `OPENAI_API_KEY=sk-...` with trailing spaces
- ❌ Missing `sk-` prefix (newer keys use `sk-proj-` prefix)

### 3. Restart Dev Server
**CRITICAL:** After adding/changing `.env.local`, you MUST restart:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Next.js only loads `.env.local` when the server starts!

### 4. Verify Key is Valid
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check if your key is active
3. If needed, create a new key and update `.env.local`

### 5. Test Key is Loaded
Visit the debug page: `http://localhost:3000/debug`

It should show:
- ✅ `OPENAI_API_KEY: [REDACTED - present]` (or similar)

### 6. Check Server Console
When you submit the form, check your terminal where `npm run dev` is running.

You should see:
- ✅ No errors about missing OPENAI_API_KEY
- ❌ If you see "OPENAI_API_KEY is not set" → env var not loaded

## Troubleshooting

### Problem: Key still not working after restart

**Solution 1: Check for typos**
```bash
# In PowerShell, check if key is loaded:
node -e "require('dotenv').config({path:'.env.local'}); console.log('Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing')"
```

**Solution 2: Clear Next.js cache**
```bash
# Stop server, then:
rm -rf .next
# Or on Windows:
Remove-Item -Recurse -Force .next
# Then restart:
npm run dev
```

**Solution 3: Verify key format**
- Old format: `sk-...` (51 chars)
- New format: `sk-proj-...` (longer)
- Both should work, but make sure no extra characters

### Problem: "401 Unauthorized" error

**Possible causes:**
1. **Invalid key** - Key was revoked or expired
2. **Wrong key** - Copied wrong key or has extra spaces
3. **Key not for API** - Some keys are only for dashboard access

**Solution:**
1. Generate a new API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Make sure to select "API" key type
3. Copy the entire key (it won't be shown again)
4. Update `.env.local` with new key
5. Restart dev server

### Problem: Key works in some routes but not others

**Solution:**
- All API routes should use the same env var
- Check that all routes check `process.env.OPENAI_API_KEY`
- Restart server to ensure all routes get the updated value

## Verification Commands

**Check if .env.local exists:**
```powershell
Test-Path .env.local
```

**Check if key is in file (without showing it):**
```powershell
Select-String -Path .env.local -Pattern "OPENAI_API_KEY"
```

**Check Next.js env loading:**
Visit `http://localhost:3000/debug` after restarting server.

## Still Not Working?

1. **Double-check these:**
   - ✅ `.env.local` is in project root
   - ✅ Key has correct format (no quotes, no spaces)
   - ✅ Dev server was restarted after adding key
   - ✅ Key is active on OpenAI dashboard

2. **Get detailed error:**
   - Check terminal output when submitting form
   - Check browser console (F12)
   - Check Network tab → API call response

3. **Test key directly:**
   ```bash
   node -e "require('dotenv').config({path:'.env.local'}); const OpenAI = require('openai'); const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY}); client.models.list().then(console.log).catch(console.error)"
   ```

