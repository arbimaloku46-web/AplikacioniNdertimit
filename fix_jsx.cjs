const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /\{showInteractiveBuilding && activeProject && \([\s\S]*?\}\)/,
  ""
);

fs.writeFileSync('App.tsx', code);
