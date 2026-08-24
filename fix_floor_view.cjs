const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

const rowTargetStr = 'className="w-full h-full flex flex-col md:flex-row absolute inset-0 overflow-y-auto md:overflow-hidden"';
const rowReplacementStr = 'className="w-full h-full flex flex-col md:flex-row absolute inset-0 overflow-y-auto md:overflow-hidden min-h-0 min-w-0"';

if (code.includes(rowTargetStr)) {
  code = code.replace(rowTargetStr, rowReplacementStr);
  fs.writeFileSync('components/InteractiveViewer.tsx', code);
  console.log('Patched Floor View Row Container');
}
