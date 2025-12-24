# Fix Styling Issues - Tailwind CSS Not Loading

If your frontend looks like plain HTML without styles, follow these steps:

## Step 1: Stop the Dev Server
Press `Ctrl+C` in your terminal to stop the running dev server.

## Step 2: Clear Next.js Cache
Delete the `.next` folder (Next.js build cache):

**In PowerShell:**
```powershell
Remove-Item -Recurse -Force .next
```

**In Command Prompt:**
```cmd
rmdir /s /q .next
```

## Step 3: Verify Configuration Files

Make sure these files exist and are correct:

1. **`tailwind.config.ts`** - Should have content paths
2. **`postcss.config.mjs`** - Should have tailwindcss and autoprefixer
3. **`app/globals.css`** - Should have @tailwind directives at the top
4. **`app/layout.tsx`** - Should import `./globals.css`

## Step 4: Reinstall Dependencies (if needed)

If clearing cache doesn't work:

```powershell
npm install
```

## Step 5: Restart Dev Server

```powershell
npm run dev
```

## Verification Checklist

✅ Tailwind CSS installed: `npm list tailwindcss`
✅ PostCSS installed: `npm list postcss`
✅ globals.css imports @tailwind directives
✅ layout.tsx imports globals.css
✅ tailwind.config.ts includes correct content paths

## Common Issues

### Issue: Styles still not loading
- Check browser console for errors
- Hard refresh browser (Ctrl+Shift+R or Ctrl+F5)
- Check if CSS file is loading in Network tab

### Issue: Some styles work but gradients don't
- Gradients are built-in Tailwind classes, should work
- Check if you're using correct Tailwind syntax

### Issue: Build errors
- Check terminal for compilation errors
- Make sure all dependencies are installed
- Try deleting node_modules and reinstalling

