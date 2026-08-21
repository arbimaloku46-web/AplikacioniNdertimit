const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
for (let i = 2140; i < 2160; i++) {
    if (lines[i].includes('</main>') && lines[i+1].includes('</div>') && lines[i+2].includes(')}')) {
        // Wait, the lines currently are:
        // 2147:           </main>
        // 2148:         </div>
        // 2149:       )}
        lines.splice(i+1, 0, '          )}');
        break;
    }
}
fs.writeFileSync('App.tsx', lines.join('\n'));
