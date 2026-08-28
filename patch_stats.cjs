const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
    /stats: \{ completion: activeProject\.updates\[0\]\?\.stats\.completion \|\| 0,/g,
    "stats: { completion: activeProject.updates[0]?.stats?.completion || 0,"
);

fs.writeFileSync('App.tsx', code);
console.log('Patched line 394 stats access');
