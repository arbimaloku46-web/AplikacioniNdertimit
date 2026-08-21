const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /\{\(activeProject\.interactiveBuilding \|\| isAdmin\) && \([\s\S]*?Explore Building\s*<\/button>\s*\)\}/,
  ""
);

fs.writeFileSync('App.tsx', code);
