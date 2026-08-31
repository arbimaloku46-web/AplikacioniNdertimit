const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

code = code.replace(/const gap = width < 768 \? 1 : 2;/, 'const gap = containerWidth < 768 ? 1 : 2;');

fs.writeFileSync('components/MediaGrid.tsx', code);
