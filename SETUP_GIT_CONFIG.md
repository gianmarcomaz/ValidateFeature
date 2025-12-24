# Configure Git Identity

Before making your first commit, Git needs to know who you are.

## Set Your Git Identity

Run these commands (replace with YOUR information):

```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email if you have an account)
git config --global user.email "your.email@example.com"
```

**Example:**
```powershell
git config --global user.name "John Doe"
git config --global user.email "john.doe@example.com"
```

## Why This is Needed

Git requires this information for commit attribution. The `--global` flag sets it for all repositories on your computer.

## After Setting Identity

Then you can commit:

```powershell
git add .
git commit -m "Initial commit: FeatureValidate MVP with Tailwind CSS and Firebase"
```

## Check Your Config

To verify it's set correctly:

```powershell
git config --global user.name
git config --global user.email
```

## For This Repository Only

If you want to set identity only for this project (not globally), omit `--global`:

```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

