const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// LEVEL 2
// Replace motion.div classes
code = code.replace(
  'className="w-full h-full flex flex-col md:flex-row absolute inset-0"',
  'className="w-full h-full flex flex-col md:flex-row absolute inset-0 overflow-y-auto md:overflow-hidden"'
);
// Replace image container classes
code = code.replace(
  'className="w-full md:w-3/4 p-6 md:p-8 flex items-center justify-center relative bg-slate-950/50"',
  'className="w-full md:w-3/4 h-auto md:h-full p-6 md:p-8 flex items-center justify-center relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0"'
);
// Replace sidebar classes
code = code.replace(
  'className="w-full md:w-1/4 bg-slate-950 border-l border-white/5 p-8 overflow-y-auto custom-scrollbar"',
  'className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink"'
);

// LEVEL 3
// Replace motion.div classes
code = code.replace(
  'className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-slate-950"',
  'className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-slate-950 overflow-y-auto md:overflow-hidden"'
);
// Replace image container classes
code = code.replace(
  'className="w-full md:w-2/3 h-full p-6 md:p-12 flex items-center justify-center bg-white"',
  'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0"'
);
// Replace sidebar classes
code = code.replace(
  'className="w-full md:w-1/3 p-8 md:p-10 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-l border-white/10"',
  'className="w-full md:w-1/3 h-auto md:h-full p-8 md:p-10 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 md:overflow-y-auto shrink-0 md:shrink"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx layouts");
