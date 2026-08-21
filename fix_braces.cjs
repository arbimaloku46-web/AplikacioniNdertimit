const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
// We have 1 extra }.
// Let's find out where by checking the end of the file.
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('};')) {
        // change }; to just ; or remove the }
        lines[i] = lines[i].replace('};', ';');
        break;
    }
}
fs.writeFileSync('App.tsx', lines.join('\n'));
