const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const unitOld = `<div key={unit.id} className="bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-3">
                               <div className="flex items-center justify-between mb-2">
                                  <input type="text" value={unit.name} onChange={e => updateUnit(floor.id, unit.id, { name: e.target.value })} className="bg-transparent border-none outline-none text-sm font-extrabold tracking-tight text-white w-2/3" />
                                  <button onClick={() => deleteUnit(floor.id, unit.id)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                               </div>`;

const unitNew = `<div key={unit.id} className={\`bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-3 \${activeUnitId === unit.id ? 'ring-1 ring-brand-blue' : ''}\`}>
                               <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => { setActiveUnitId(activeUnitId === unit.id ? null : unit.id); setMode('idle'); }}>
                                  <input type="text" value={unit.name} onChange={e => updateUnit(floor.id, unit.id, { name: e.target.value })} onClick={e => e.stopPropagation()} className="bg-transparent border-none outline-none text-sm font-extrabold tracking-tight text-white w-2/3 focus:ring-1 focus:ring-brand-blue rounded px-1" />
                                  <button onClick={(e) => { e.stopPropagation(); deleteUnit(floor.id, unit.id); }} className="text-slate-500 hover:text-red-400 p-1"><X className="w-4 h-4" /></button>
                               </div>`;

code = code.replace(unitOld, unitNew);

// Also let's make sure Floor click sets mode to idle so it previews
code = code.replace(
  `onClick={() => setActiveFloorId(activeFloorId === floor.id ? null : floor.id)}`,
  `onClick={() => { setActiveFloorId(activeFloorId === floor.id ? null : floor.id); setMode('idle'); setActiveUnitId(null); }}`
);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log("Patched unit header and floor click");
