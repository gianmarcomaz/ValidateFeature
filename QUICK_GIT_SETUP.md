# Quick Git & GitHub Setup

## 🚀 Fast Track (After Installing Git)

### 1. Install Git
Download from: https://git-scm.com/download/win
- During install, check "Add Git to PATH"
- Restart terminal after install

### 2. Initialize & Push (All in one)

```powershell
# Initialize
git init
git add .
git commit -m "Initial commit: FeatureValidate MVP"

# Connect to GitHub (after creating repo on github.com)
git remote add origin https://github.com/YOUR_USERNAME/feature-validate.git
git branch -M main
git push -u origin main
```

### 3. Create GitHub Repo
- Go to: https://github.com/new
- Name: `feature-validate`
- Don't initialize with README
- Copy the repo URL and use in step 2

### 4. Authentication
- Use Personal Access Token (not password)
- Get token: https://github.com/settings/tokens
- Scope: `repo` (full control)

---

**See GITHUB_SETUP.md for detailed instructions**

