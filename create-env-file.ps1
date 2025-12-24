# PowerShell script to create .env.local file
# Run this script to create your .env.local file

$envContent = @"
# OpenAI API Key
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=validatefeature.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=validatefeature
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=validatefeature.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=494209034180
NEXT_PUBLIC_FIREBASE_APP_ID=1:494209034180:web:f593a011968e884fec2691
"@

# Check if .env.local already exists
if (Test-Path .env.local) {
    $response = Read-Host ".env.local already exists. Overwrite? (y/n)"
    if ($response -ne "y") {
        Write-Host "Cancelled. .env.local not created." -ForegroundColor Yellow
        exit
    }
}

# Write the file
$envContent | Out-File -FilePath .env.local -Encoding utf8 -NoNewline
Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host "⚠️  NOTE: You still need to add your NEXT_PUBLIC_FIREBASE_API_KEY value!" -ForegroundColor Yellow

