const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
for (let i = 2140; i < 2160; i++) {
    if (lines[i].includes('</main>') && lines[i+1].includes(')}')) {
        lines.splice(i+1, 0, '        </div>');
        break;
    }
}
fs.writeFileSync('App.tsx', lines.join('\n'));
