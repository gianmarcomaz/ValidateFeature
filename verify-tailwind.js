// Quick verification script - run: node verify-tailwind.js
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Tailwind CSS Setup...\n');

// Check package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasTailwind = packageJson.devDependencies?.tailwindcss || packageJson.dependencies?.tailwindcss;
console.log('✅ Tailwind in package.json:', hasTailwind ? 'YES' : 'NO');

// Check tailwind.config.ts
const hasTailwindConfig = fs.existsSync('tailwind.config.ts');
console.log('✅ tailwind.config.ts exists:', hasTailwindConfig ? 'YES' : 'NO');

// Check postcss.config.mjs
const hasPostCSS = fs.existsSync('postcss.config.mjs');
console.log('✅ postcss.config.mjs exists:', hasPostCSS ? 'YES' : 'NO');

// Check globals.css
const globalsCSS = fs.readFileSync('app/globals.css', 'utf8');
const hasTailwindDirectives = globalsCSS.includes('@tailwind base') && 
                               globalsCSS.includes('@tailwind components') && 
                               globalsCSS.includes('@tailwind utilities');
console.log('✅ globals.css has @tailwind directives:', hasTailwindDirectives ? 'YES' : 'NO');

// Check layout.tsx
const layoutTSX = fs.readFileSync('app/layout.tsx', 'utf8');
const importsCSS = layoutTSX.includes('globals.css');
console.log('✅ layout.tsx imports globals.css:', importsCSS ? 'YES' : 'NO');

console.log('\n💡 If all are YES, restart your dev server:\n   npm run dev\n');

