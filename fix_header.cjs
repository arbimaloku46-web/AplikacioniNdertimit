const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /\{renderHeader\(\)\}\{" "\}/,
  "{projectTab !== 'explore' && renderHeader()} "
);

fs.writeFileSync('App.tsx', code);
