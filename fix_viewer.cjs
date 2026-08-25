const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1
code = code.replace(
  'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl" style={{ lineHeight: 0 }}',
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"'
);
code = code.replace(
  'className="block max-w-full max-h-full w-auto h-auto"',
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"'
);

// Level 2 Container
code = code.replace(
  'className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0 min-w-0 overflow-hidden"',
  'className="w-full md:w-3/4 h-[50vh] md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-w-0 overflow-hidden"'
);
code = code.replace(
  'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white" style={{ lineHeight: 0 }}',
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"'
);
code = code.replace(
  'className="block max-w-full max-h-full w-auto h-auto"',
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"'
);

// Level 3 Container
code = code.replace(
  'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0 min-w-0 overflow-hidden"',
  'className="w-full md:w-2/3 h-[50vh] md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-w-0 overflow-hidden"'
);
code = code.replace(
  'className="relative inline-block max-w-full max-h-full" style={{ lineHeight: 0 }}',
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full"'
);
code = code.replace(
  'className="block max-w-full max-h-full w-auto h-auto"',
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Fixed InteractiveViewer layout constraints');
