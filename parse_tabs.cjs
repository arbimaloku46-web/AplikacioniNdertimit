const fs = require('fs');
const lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes("Weekly Discussion Tab"));
console.log(lines.slice(startIndex - 5, startIndex + 100).join('\n'));
