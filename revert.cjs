const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(/^( *)(\{" "\})?$/);
  if (match) {
    if (lines[i].length > 0) { // Don't replace truly empty lines if we can avoid it, but wait, `    </div>` alone became empty!
       // Let's replace it
       const spaces = match[1];
       const suffix = match[2] || '';
       lines[i] = spaces + '    </div>' + (suffix ? ' ' + suffix : '');
    }
  }
}
fs.writeFileSync('App.tsx', lines.join('\n'));
