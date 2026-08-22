const fs = require('fs');
let code = fs.readFileSync('types.ts', 'utf8');

code = code.replace(
  "MAPPER = 'MAPPER'",
  "MAPPER = 'MAPPER',\n  INTERACTIVE_VIEWER = 'INTERACTIVE_VIEWER'"
);

fs.writeFileSync('types.ts', code);
console.log("Patched types.ts");
