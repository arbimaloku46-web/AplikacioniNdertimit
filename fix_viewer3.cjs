const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 2 Container
code = code.replace(
  'className="w-full md:w-3/4 h-[50vh] md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-w-0 overflow-hidden"',
  'className="w-full md:w-3/4 h-[50vh] md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-w-0 min-h-0 overflow-hidden"'
);

// Level 3 Container
code = code.replace(
  'className="w-full md:w-2/3 h-[50vh] md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-w-0 overflow-hidden"',
  'className="w-full md:w-2/3 h-[50vh] md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-w-0 min-h-0 overflow-hidden"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
