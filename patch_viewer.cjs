const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Replace unit.specs.area in the list view
code = code.replace(
  '<span>{unit.specs.area} m²</span>',
  '<span>{unit.specs.totalArea} m²</span>'
);

// Replace unit.specs.area in the detail view and add the other two areas
code = code.replace(
  /<div className="bg-slate-950 border border-white\/5 p-6 md:p-5 rounded-2xl">\n                      <p className="text-slate-500 text-\[10px\] uppercase tracking-widest font-extrabold tracking-tight mb-1">Total Area<\/p>\n                      <p className="text-2xl font-medium text-white">{activeUnit\.specs\.area} <span className="text-sm text-slate-500">m²<\/span><\/p>\n                    <\/div>/,
  `<div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Total Area</p>
                      <p className="text-xl font-medium text-white">{activeUnit.specs.totalArea} <span className="text-sm text-slate-500">m²</span></p>
                    </div>
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Inside Area</p>
                      <p className="text-xl font-medium text-white">{activeUnit.specs.insideArea} <span className="text-sm text-slate-500">m²</span></p>
                    </div>
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Shared Area</p>
                      <p className="text-xl font-medium text-white">{activeUnit.specs.sharedArea} <span className="text-sm text-slate-500">m²</span></p>
                    </div>`
);

// Also need to make the specs grid capable of fitting more items
// Original was `grid grid-cols-2 gap-6 mb-8`
// Now there are 6 items (beds, baths, total, inside, shared, price). So maybe grid-cols-3 or keep grid-cols-2.
// Let's change grid-cols-2 to grid-cols-2 md:grid-cols-3
code = code.replace(
  '<div className="grid grid-cols-2 gap-6 mb-8">',
  '<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx");
