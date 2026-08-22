const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  'specs: { beds: 4, baths: 3.5, area: 250, price: "$2,500,000" }',
  'specs: { beds: 4, baths: 3.5, totalArea: 250, insideArea: 200, sharedArea: 50, price: "$2,500,000" }'
);

fs.writeFileSync('App.tsx', code);
console.log("Patched App.tsx (DEMO_INTERACTIVE_BUILDING)");
