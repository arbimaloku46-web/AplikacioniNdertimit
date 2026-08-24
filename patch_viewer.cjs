const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

code = code.replace(
  '<div className="flex items-center justify-between p-6 md:p-8 text-white border-b border-white/10 shrink-0">',
  '<div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 text-white border-b border-white/10 shrink-0 bg-slate-950 z-20">'
);
code = code.replace(
  '<h2 className="font-display font-extrabold tracking-tight text-xl md:text-2xl flex items-center gap-2">',
  '<h2 className="font-display font-bold tracking-tight text-lg md:text-xl flex items-center gap-2">'
);
code = code.replace(
  '<button \n          onClick={onClose}\n          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ease-in-out"',
  '<button \n          onClick={onClose}\n          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ease-in-out"'
);
code = code.replace(
  '<X className="w-6 h-6" />',
  '<X className="w-5 h-5" />'
);

code = code.replace(
  '<div className="bg-slate-950 p-6 flex items-center justify-between border-b border-white/5 z-10 relative">',
  '<div className="bg-slate-950 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-white/5 z-10 relative">'
);

// We also should maximize the images inside by removing padding from container
code = code.replace(
  '<div className="w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0">',
  '<div className="w-full h-full flex items-center justify-center absolute inset-0">'
);
code = code.replace(
  '<img \n                  src={data.mainImageUrl} \n                  alt={data.name} \n                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"',
  '<img \n                  src={data.mainImageUrl} \n                  alt={data.name} \n                  className="w-full h-[85vh] object-contain drop-shadow-2xl"'
);

// Floor plan level
code = code.replace(
  '<div className="w-full md:w-3/4 h-auto md:h-full p-6 md:p-8 flex items-center justify-center relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0">',
  '<div className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0">'
);
code = code.replace(
  '<img \n                    src={activeFloor.floorPlanUrl} \n                    alt={activeFloor.name} \n                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl bg-white"',
  '<img \n                    src={activeFloor.floorPlanUrl} \n                    alt={activeFloor.name} \n                    className="w-full h-[85vh] object-contain shadow-2xl bg-white"'
);


// Unit view level
code = code.replace(
  '<div className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0">',
  '<div className="w-full md:w-2/3 h-auto md:h-full p-2 md:p-4 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0">'
);
code = code.replace(
  '<img \n                  src={activeUnit.floorPlanUrl} \n                  alt={activeUnit.name} \n                  className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl"',
  '<img \n                  src={activeUnit.floorPlanUrl} \n                  alt={activeUnit.name} \n                  className="w-full h-[85vh] object-contain drop-shadow-2xl"'
);


fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx");
