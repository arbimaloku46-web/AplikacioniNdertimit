const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
    /activeProject\.updates/g,
    "(activeProject.updates || [])"
);

fs.writeFileSync('App.tsx', code);
console.log('Patched activeProject.updates');
