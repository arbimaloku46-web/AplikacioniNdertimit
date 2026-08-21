const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
// We want to delete 2267 and 2268
// Wait, to be safe:
let changed = false;
for (let i = 2260; i < 2275; i++) {
    if (lines[i].includes('</div>') && lines[i+1].includes(')}')) {
        lines.splice(i, 2);
        changed = true;
        break;
    }
}
fs.writeFileSync('App.tsx', lines.join('\n'));
console.log("Changed:", changed);
