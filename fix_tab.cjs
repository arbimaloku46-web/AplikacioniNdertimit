const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  'onClick={() => setProjectTab(tab.id)}',
  'onClick={() => setProjectTab(tab.id as any)}'
);

fs.writeFileSync('App.tsx', code);
console.log('Fixed project tab set');
