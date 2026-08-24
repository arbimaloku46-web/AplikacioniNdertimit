const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// For InteractiveViewer, we need the parent div of the images to be `relative flex` and the images to be `object-contain`.

// Exterior View
code = code.replace(
  '<div className="w-full h-full flex items-center justify-center absolute inset-0">',
  '<div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 absolute inset-0">'
);
code = code.replace(
  '<div className="relative inline-block max-w-full max-h-full">',
  '<div className="relative flex max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">'
);
code = code.replace(
  'className="block w-auto h-auto max-w-full max-h-[85vh] drop-shadow-2xl"',
  'className="block max-w-full max-h-full w-auto h-auto object-contain"'
);

// Floor View
code = code.replace(
  '<div className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0">',
  '<div className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0">'
);
code = code.replace(
  '<div className="relative inline-block max-w-full max-h-full">',
  '<div className="relative flex max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white">'
);
code = code.replace(
  'className="block w-auto h-auto max-w-full max-h-[85vh] shadow-2xl bg-white"',
  'className="block max-w-full max-h-full w-auto h-auto object-contain"'
);

// Unit View
code = code.replace(
  '<div className="w-full md:w-2/3 h-auto md:h-full p-2 md:p-4 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0">',
  '<div className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0">'
);
code = code.replace(
  'className="block w-auto h-auto max-w-full max-h-[85vh] drop-shadow-2xl"',
  'className="block max-w-full max-h-full w-auto h-auto object-contain"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched interactive");
