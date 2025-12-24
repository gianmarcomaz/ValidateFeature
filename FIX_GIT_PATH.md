# Fix Git "Not Recognized" Error

After installing Git, if you still get "git is not recognized", the terminal hasn't picked up the PATH changes. Here are solutions:

## Solution 1: Restart Terminal (Easiest)

1. **Close your current PowerShell/terminal completely**
2. **Open a NEW PowerShell window**
3. Navigate back to your project:
   ```powershell
   cd C:\Users\gianm\Desktop\Everything\Projects\Validate
   ```
4. Try: `git --version`

This works 90% of the time because PATH changes require a new terminal session.

## Solution 2: Restart Computer

If Solution 1 doesn't work, restart your computer. This ensures all PATH changes are loaded.

## Solution 3: Add Git to PATH Manually

If Git is installed but not in PATH:

### Find Git Installation
Git is usually installed at:
- `C:\Program Files\Git\cmd\`
- `C:\Program Files (x86)\Git\cmd\`

### Add to PATH (Temporary - Current Session Only)
```powershell
# Check if Git exists
Test-Path "C:\Program Files\Git\cmd\git.exe"

# If true, add to PATH for this session
$env:PATH += ";C:\Program Files\Git\cmd"

# Test it
git --version
```

### Add to PATH (Permanent)
1. Press `Win + X` → System → Advanced system settings
2. Click "Environment Variables"
3. Under "User variables" or "System variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add: `C:\Program Files\Git\cmd`
7. Click OK on all dialogs
8. **Close and reopen your terminal**

## Solution 4: Reinstall Git with Correct Options

If Git still doesn't work, reinstall it:

1. Uninstall Git (Settings → Apps → Git)
2. Download again: https://git-scm.com/download/win
3. During installation, **select:**
   - "Git from the command line and also from 3rd-party software"
   - This adds Git to PATH automatically
4. Complete installation
5. **Restart terminal** or computer

## Solution 5: Use Full Path (Temporary Workaround)

If you need to use Git immediately while fixing PATH:

```powershell
# Use full path to git
& "C:\Program Files\Git\cmd\git.exe" --version
& "C:\Program Files\Git\cmd\git.exe" init
```

## Quick Diagnostic Commands

Run these to diagnose:

```powershell
# Check if Git executable exists
Test-Path "C:\Program Files\Git\cmd\git.exe"

# Check current PATH for Git
$env:PATH -split ';' | Select-String git

# Try to find Git
Get-Command git -ErrorAction SilentlyContinue

# Check common Git locations
Get-ChildItem "C:\Program Files\Git" -ErrorAction SilentlyContinue
Get-ChildItem "C:\Program Files (x86)\Git" -ErrorAction SilentlyContinue
```

## Expected Result

After fixing, `git --version` should show:
```
git version 2.xx.x.windows.x
```

Then you can proceed with:
```powershell
git init
git add .
git commit -m "Initial commit"
```

