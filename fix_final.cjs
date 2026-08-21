const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
if (lines[lines.length - 4].includes('</div>')) {
    lines.splice(lines.length - 4, 1);
}
fs.writeFileSync('App.tsx', lines.join('\n'));
