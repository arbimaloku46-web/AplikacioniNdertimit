const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

code = code.replace(
  'area: number;',
  'totalArea: number;\n    insideArea: number;\n    sharedArea: number;'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx (types)");
