const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

const targetStr = 'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0"';
const replacementStr = 'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0 min-w-0"';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('components/InteractiveViewer.tsx', code);
  console.log('Patched Unit View');
}

// Ensure flex-row container has min-h-0 min-w-0
const rowTargetStr = 'className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-slate-950 overflow-y-auto md:overflow-hidden"';
const rowReplacementStr = 'className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-slate-950 overflow-y-auto md:overflow-hidden min-h-0 min-w-0"';

if (code.includes(rowTargetStr)) {
  code = code.replace(rowTargetStr, rowReplacementStr);
  fs.writeFileSync('components/InteractiveViewer.tsx', code);
  console.log('Patched Unit View Row Container');
}
