const fs = require('fs');
const https = require('https');
const path = require('path');

console.log("Starting Serper API debug script...");

// Load .env.local
try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    console.log("Reading env from:", envPath);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // simple unquote
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e.message);
}

const apiKey = process.env.SERPER_API_KEY;
if (!apiKey) {
    console.error("❌ SERPER_API_KEY not found in .env.local");
    process.exit(1);
}

console.log("Testing Serper API with key prefix:", apiKey.slice(0, 5) + "...");

const data = JSON.stringify({
    q: "test query startup",
    num: 1
});

const options = {
    hostname: 'google.serper.dev',
    path: '/search',
    method: 'POST',
    headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Result Preview:', body.substring(0, 200));
        try {
            const json = JSON.parse(body);
            if (json.organic && json.organic.length > 0) {
                console.log("✅ Success! Found results:", json.organic.length);
            } else {
                console.log("⚠️  Response parsed but no organic results found.");
                console.log("Full Response:", body);
            }
        } catch (e) {
            console.log("❌ Failed to parse JSON response");
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ problem with request: ${e.message}`);
});

req.write(data);
req.end();
