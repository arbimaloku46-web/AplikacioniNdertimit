const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');
content = content.replace(/\}\);\n\}\);/, "});");
content = content.replace(/\}\);\n\}/, "}");
fs.writeFileSync('index.tsx', content);
