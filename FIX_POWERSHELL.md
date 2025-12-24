# Fix PowerShell Execution Policy Error

If you see: `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled`

This is a Windows PowerShell security feature blocking script execution. Here are solutions:

## Solution 1: Change Execution Policy (Recommended for Development)

Run PowerShell as Administrator, then execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then type `Y` when prompted.

**What this does:**
- Allows local scripts to run (like npm)
- Still requires downloaded scripts to be signed
- Only applies to your user account (safe)

After this, close and reopen your terminal, then try `npm --version` again.

## Solution 2: Bypass for Current Session Only

If you can't change the policy permanently, you can bypass it for the current session:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Note: This only works for the current PowerShell window.

## Solution 3: Use Command Prompt Instead

Alternatively, you can use Command Prompt (cmd.exe) instead of PowerShell:
- Open Command Prompt (cmd.exe)
- Navigate to your project: `cd C:\Users\gianm\Desktop\Everything\Projects\Validate`
- Run `npm install` (should work without issues)

## Solution 4: Use Git Bash or WSL

If you have Git Bash or WSL (Windows Subsystem for Linux), npm works there without execution policy issues.

## Verify It Works

After applying Solution 1, close and reopen PowerShell, then:

```powershell
npm --version
node --version
```

Both should show version numbers without errors.

