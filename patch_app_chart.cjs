const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Executive Update chart height
code = code.replace(
  '<div className="h-48 w-full mb-8">',
  '<div className="h-32 w-full mb-6">'
);

// Location - remove the paddings and let it bleed
// Original:
/*
{activeProject.coordinates && (
    <div className="pt-6 md:pt-8 border-t border-white/5">
        <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase tracking-widest block mb-4">Exact Location</span>
        <LocationPicker 
            initialPosition={activeProject.coordinates}
            readOnly={true}
        />
    </div>
)}
*/
code = code.replace(
  '<div className="pt-6 md:pt-8 border-t border-white/5">\n                                            <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase tracking-widest block mb-4">Exact Location</span>\n                                            <LocationPicker \n                                                initialPosition={activeProject.coordinates}\n                                                readOnly={true}\n                                            />\n                                        </div>',
  `<div className="-mx-8 -mb-8 mt-8 border-t border-white/5 relative overflow-hidden rounded-b-3xl">
                                            <div className="absolute top-4 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                                                <span className="text-[10px] text-white font-extrabold tracking-tight uppercase tracking-widest block">Exact Location</span>
                                            </div>
                                            <LocationPicker 
                                                initialPosition={activeProject.coordinates}
                                                readOnly={true}
                                            />
                                        </div>`
);

// Change workforce widget design to match Weather
code = code.replace(
  '<div className="bg-white/5 p-3 md:p-6 rounded-2xl md:rounded-2xl flex flex-col justify-between h-full min-h-[80px] relative group cursor-pointer border border-transparent hover:border-white/10 transition-colors">',
  '<div className="bg-slate-800/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/40 p-4 md:p-6 rounded-2xl flex flex-col justify-between h-full min-h-[100px] w-full relative group cursor-pointer hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-in-out">'
);

fs.writeFileSync('App.tsx', code);
console.log("Patched App.tsx for Chart, Location, and Workforce");
