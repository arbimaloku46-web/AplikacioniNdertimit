const fs = require('fs');

function patchFile(filename, replaceConfig) {
  let code = fs.readFileSync(filename, 'utf8');
  let patched = false;
  for (const [oldStr, newStr] of replaceConfig) {
    if (code.includes(oldStr)) {
      code = code.split(oldStr).join(newStr);
      patched = true;
    } else {
      console.log(`Not found in ${filename}:\n${oldStr}\n`);
    }
  }
  if (patched) {
    fs.writeFileSync(filename, code);
    console.log(`Patched ${filename}`);
  }
}

// BuildingConfigurator
patchFile('components/BuildingConfigurator.tsx', [
  [
    'className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 h-full overflow-hidden"',
    'className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 min-w-0 h-full overflow-hidden"'
  ],
  [
    'className="relative inline-block max-w-full max-h-full rounded-2xl shadow-2xl"',
    'className="relative flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl shadow-2xl"'
  ],
  [
    'className={`block max-w-full max-h-full w-auto h-auto object-contain rounded-2xl select-none ${mode !== \'idle\' ? \'cursor-crosshair\' : \'\'}`}',
    'className={`block max-w-full max-h-full w-auto h-auto rounded-2xl select-none ${mode !== \'idle\' ? \'cursor-crosshair\' : \'\'}`} style={{ minHeight: 0, minWidth: 0 }}'
  ]
]);

// InteractiveViewer
patchFile('components/InteractiveViewer.tsx', [
  // Exterior view parent
  [
    'className="w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0"',
    'className="w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0 min-h-0 min-w-0"'
  ],
  // Exterior view wrapper
  [
    'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"',
    'className="relative flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl"'
  ],
  // Exterior view img
  [
    'className="block max-w-full max-h-full w-auto h-auto object-contain"',
    'className="block max-w-full max-h-full w-auto h-auto" style={{ minHeight: 0, minWidth: 0 }}'
  ],
  // Floor view parent
  [
    'className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0"',
    'className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0 min-w-0"'
  ],
  // Floor view wrapper
  [
    'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"',
    'className="relative flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl bg-white"'
  ]
]);

