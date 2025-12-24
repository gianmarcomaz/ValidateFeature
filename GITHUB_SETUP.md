# GitHub Setup Guide

## Step 1: Install Git

Git is not installed on your system. You need to install it first.

### Option A: Download Git for Windows (Recommended)

1. Go to https://git-scm.com/download/win
2. Download the latest version (it will auto-detect your system)
3. Run the installer
4. **Important**: During installation, make sure to:
   - Check "Add Git to PATH" option (or use default "Git from the command line and also from 3rd-party software")
   - Accept all default settings
5. **Restart your terminal/PowerShell** after installation

### Option B: Install via Winget (if you have it)

```powershell
winget install --id Git.Git -e --source winget
```

### Verify Installation

After installing, close and reopen your terminal, then run:

```powershell
git --version
```

You should see something like: `git version 2.x.x`

## Step 2: Initialize Git Repository

Once Git is installed, run these commands:

```powershell
# Navigate to your project (if not already there)
cd C:\Users\gianm\Desktop\Everything\Projects\Validate

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FeatureValidate MVP"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Sign in to your GitHub account (create one if needed)
3. Repository name: `feature-validate` (or any name you prefer)
4. Description: "Validate your next feature in minutes"
5. Choose **Private** or **Public**
6. **DO NOT** initialize with README, .gitignore, or license (we already have files)
7. Click "Create repository"

## Step 4: Connect Local Repository to GitHub

After creating the repo on GitHub, you'll see setup instructions. Use these commands:

```powershell
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/feature-validate.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You'll be prompted for your GitHub username and password (use a Personal Access Token, not your password - see below).

## Step 5: Authentication (Personal Access Token)

GitHub no longer accepts passwords. You need a Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "FeatureValidate Project"
4. Select scopes: Check "repo" (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

### Alternative: GitHub CLI

You can also use GitHub CLI for easier authentication:

```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login

# Then create repo from command line
gh repo create feature-validate --private --source=. --remote=origin --push
```

## Complete Command Sequence

Here's the full sequence after Git is installed:

```powershell
# 1. Initialize repository
git init

# 2. Create .gitignore (if not exists - we already have one)
# Our .gitignore already covers node_modules, .next, .env, etc.

# 3. Add all files
git add .

# 4. Initial commit
git commit -m "Initial commit: FeatureValidate MVP with Tailwind CSS and Firebase"

# 5. Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/feature-validate.git

# 6. Push to GitHub (use Personal Access Token as password)
git push -u origin main
```

## Troubleshooting

### "git: command not found" after installation
- Close and reopen your terminal
- Verify PATH: `$env:PATH -split ';' | Select-String git`
- Restart your computer if needed

### "Authentication failed"
- Use Personal Access Token, not password
- Make sure token has "repo" scope
- Try using SSH instead: `git remote set-url origin git@github.com:USERNAME/REPO.git`

### "fatal: not a git repository"
- Make sure you're in the project directory
- Run `git init` first

### Want to update .gitignore first?

Our current `.gitignore` already includes:
- `node_modules/`
- `.next/`
- `.env*.local`
- `.env`

This is perfect for Next.js projects!

