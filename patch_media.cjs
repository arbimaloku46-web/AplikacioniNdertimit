const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
    /media=\{\(activeProject\.updates \|\| \[\]\)\[activeUpdateIndex\]\.media\}/g,
    "media={(activeProject.updates || [])[activeUpdateIndex]?.media || []}"
);

fs.writeFileSync('App.tsx', code);
console.log('Patched media');
