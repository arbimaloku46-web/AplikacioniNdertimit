const fs = require('fs');
let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
viteConfig = viteConfig.replace(/'process\.env\.NODE_ENV': JSON\.stringify\(mode\)/, "'process.env.NODE_ENV': JSON.stringify(mode),\n      'import.meta.env.VITE_MAPTILER_API_KEY': JSON.stringify(env.MAPTILER_API_KEY || '')");
fs.writeFileSync('vite.config.ts', viteConfig);
