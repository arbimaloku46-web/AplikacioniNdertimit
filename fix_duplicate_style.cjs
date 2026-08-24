const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

code = code.replace(/style=\{\{\s*lineHeight:\s*0\s*\}\}\s*style=\{\{\s*lineHeight:\s*0\s*\}\}/g, 'style={{ lineHeight: 0 }}');

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Fixed duplicate style attributes');
