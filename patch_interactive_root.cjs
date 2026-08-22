const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

code = code.replace(
  'className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-md"',
  'className="min-h-screen bg-brand-dark flex flex-col"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx root");
