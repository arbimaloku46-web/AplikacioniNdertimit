const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1: Exterior
code = code.replace(
  'className="w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0 min-h-0 min-w-0"',
  'className="w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0 min-h-0 min-w-0 overflow-hidden"'
);

// Level 2: Floor
code = code.replace(
  'className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0 min-w-0"',
  'className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0 min-w-0 overflow-hidden"'
);

// Level 3: Unit
code = code.replace(
  'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0 min-w-0"',
  'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0 min-w-0 overflow-hidden"'
);

// We should also ensure the `min-h-[500px]` parent has `overflow-hidden`.
code = code.replace(
  'className="flex-1 relative flex bg-slate-900/50 min-h-[500px]"',
  'className="flex-1 relative flex bg-slate-900/50 min-h-[500px] overflow-hidden"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Patched InteractiveViewer overflows');
