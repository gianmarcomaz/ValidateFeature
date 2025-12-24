# Fix PowerShell Execution Policy Error

If you're getting: `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled`

## Solution 1: Use Command Prompt (Easiest - Recommended)

Instead of PowerShell, use **Command Prompt** (cmd.exe):

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project:
   ```
   cd C:\Users\gianm\Desktop\Everything\Projects\Validate
   ```
4. Run:
   ```
   npm run dev
   ```

This works without any execution policy changes!

## Solution 2: Fix PowerShell Execution Policy

If you want to use PowerShell, try these in order:

### Option A: Bypass for Current Session
In your PowerShell window, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```
Then try `npm run dev` again. This only affects the current window.

### Option B: Run as Administrator
1. Right-click PowerShell → "Run as Administrator"
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` when prompted
4. Close and reopen PowerShell
5. Navigate to your project and try `npm run dev`

### Option C: Use npx directly
Try bypassing npm.ps1 by using the full path:
```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

## Solution 3: Use Git Bash or WSL

If you have Git Bash or WSL installed, npm works there without execution policy issues.

