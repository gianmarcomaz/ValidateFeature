# Permanent Fix for Git PATH Issue

## The Problem

Git is installed, but it's not in your PATH environment variable. The temporary fix I applied only works for that specific terminal session. When you open a new terminal, Git isn't recognized again.

## Permanent Solution Options

### Option 1: Restart VS Code (Easiest - Try This First!)

1. **Close VS Code completely** (close all windows)
2. **Reopen VS Code**
3. **Open a new terminal** (Terminal → New Terminal)
4. Try: `git --version`

This usually works because VS Code will pick up the PATH changes after Git installation.

### Option 2: Restart Your Computer

1. **Save all your work**
2. **Restart your computer**
3. After restart, open VS Code and try: `git --version`

This is the most reliable way to ensure PATH is fully updated.

### Option 3: Add Git to PATH Manually (If Options 1 & 2 Don't Work)

If restarting doesn't work, add Git to PATH manually:

#### Steps:

1. **Find Git Installation Path**
   - Usually: `C:\Program Files\Git\cmd`

2. **Open Environment Variables**
   - Press `Win + X`
   - Click "System"
   - Click "Advanced system settings" (on the right)
   - Click "Environment Variables" button (bottom)

3. **Edit PATH Variable**
   - Under "User variables" (top section), find "Path"
   - Select it and click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Git\cmd`
   - Click "OK" on all dialogs

4. **Restart VS Code/Terminal**
   - Close VS Code completely
   - Reopen VS Code
   - Open new terminal
   - Test: `git --version`

### Option 4: Verify Git Installation

Make sure Git was installed correctly:

1. Check if Git exists:
   ```powershell
   Test-Path "C:\Program Files\Git\cmd\git.exe"
   ```
   Should return: `True`

2. If it returns `False`, Git might not be installed correctly. Reinstall:
   - Download from: https://git-scm.com/download/win
   - During installation, make sure to select:
     - **"Git from the command line and also from 3rd-party software"**
     - This automatically adds Git to PATH

## Quick Test Commands

After trying any option above, test with:

```powershell
# Test if Git works
git --version

# Should show: git version 2.x.x.windows.x
```

## Why This Happens

When you install Git:
- The installer updates the system PATH
- But **existing** terminal windows don't see the change
- Only **new** terminal windows will see the updated PATH
- That's why restarting VS Code/computer usually fixes it

## Current Workaround (Temporary)

If you need to use Git RIGHT NOW in this terminal:

```powershell
# Add Git to PATH for this session only
$env:PATH += ";C:\Program Files\Git\cmd"

# Now Git commands will work in THIS terminal
git --version
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

But remember: **This only works in this terminal window!** Close it and you'll need to do it again.

## Recommended Action

**Try Option 1 first** (Restart VS Code). It's the easiest and works 90% of the time!

