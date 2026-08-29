const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
    /firstIndex = project\.updates\.findIndex\(u => u\.status !== 'draft'\);/g,
    "firstIndex = (project.updates || []).findIndex(u => u.status !== 'draft');"
);

fs.writeFileSync('App.tsx', code);
console.log('Patched handleProjectSelect');
