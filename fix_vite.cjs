const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');
content = content.replace(/'__MAPTILER_API_KEY__': JSON\.stringify\(env\.MAPTILER_API_KEY \|\| ''\)/, "'import.meta.env.VITE_MAPTILER_API_KEY': JSON.stringify(env.MAPTILER_API_KEY || '')");
fs.writeFileSync('vite.config.ts', content);
