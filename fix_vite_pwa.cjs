const fs = require('fs');

let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/clientsClaim: true,/, "clientsClaim: true,\n          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,");
fs.writeFileSync('vite.config.ts', content);
