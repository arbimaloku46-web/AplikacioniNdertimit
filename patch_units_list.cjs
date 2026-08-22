const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// The Level 2 Floor units list (line 280+)
// Replace custom-scrollbar min-h-0 with flex-1 min-h-[50vh] md:min-h-0 just in case to make sure it scrolls properly
code = code.replace(
  'className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink"',
  'className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink-0 flex-1 md:flex-none"'
);

// Level 3 unit info
code = code.replace(
  'className="w-full md:w-1/3 h-auto md:h-full p-8 md:p-10 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 md:overflow-y-auto shrink-0 md:shrink"',
  'className="w-full md:w-1/3 h-auto md:h-full p-8 md:p-10 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 md:overflow-y-auto shrink-0 md:shrink-0 flex-1 md:flex-none"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx scrolling again");
