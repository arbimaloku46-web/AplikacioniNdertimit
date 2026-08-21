const fs = require('fs');
const lines = fs.readFileSync('App.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l === '' || /^\s+$/.test(l) || /^\s*\{" "\}$/.test(l) || /^\s*\)\;?$/.test(l)) {
        console.log(`Line ${i + 1}: '${l}'`);
    }
}
