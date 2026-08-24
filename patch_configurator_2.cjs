const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const target1 = '<div className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">';
const rep1 = '<div className="relative flex max-w-full max-h-full rounded-2xl shadow-2xl">';

const target2 = 'className={`block w-auto h-auto max-w-full max-h-[75vh] select-none ${mode !== \'idle\' ? \'cursor-crosshair\' : \'\'}`}';
const rep2 = 'className={`block max-w-full max-h-full w-auto h-auto object-contain rounded-2xl select-none ${mode !== \'idle\' ? \'cursor-crosshair\' : \'\'}`}';

if (code.includes(target1) && code.includes(target2)) {
    code = code.replace(target1, rep1);
    code = code.replace(target2, rep2);
    console.log("Patched 1");
}

code = code.replace(
  '<div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-8 border border-white/5 shadow-inner min-h-[500px] lg:min-h-0 h-full overflow-hidden">',
  '<div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 h-full overflow-hidden">'
);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log("Done");
