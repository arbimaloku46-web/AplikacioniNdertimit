const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const floorInputOld = `<label className="block text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Plan Image URL</label>
                        <div className="flex gap-2">
                          <input type="text" value={floor.floorPlanUrl} onChange={e => updateFloor(floor.id, { floorPlanUrl: e.target.value })} className="flex-1 bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-2 text-xs text-white" />
                          <label className="cursor-pointer bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue p-2 rounded-lg flex items-center justify-center transition-all">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => updateFloor(floor.id, { floorPlanUrl: url }))} />
                          </label>
                        </div>`;

const floorInputNew = `<label className="block text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Plan Image</label>
                        <div className="flex gap-2 items-center">
                          {floor.floorPlanUrl && <img src={floor.floorPlanUrl} className="w-8 h-8 object-cover rounded border border-white/10" />}
                          <label className="flex-1 cursor-pointer bg-slate-950 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 p-2 rounded-lg flex items-center justify-center transition-all text-[10px] font-extrabold">
                            <Upload className="w-3 h-3 mr-1" /> {floor.floorPlanUrl ? 'Change' : 'Upload'}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => updateFloor(floor.id, { floorPlanUrl: url }))} />
                          </label>
                        </div>`;

const unitInputOld = `<div className="flex gap-2 mb-2">
                                 <input 
                                   type="text" 
                                   placeholder="Unit Plan URL" 
                                   value={unit.floorPlanUrl} 
                                   onChange={e => updateUnit(floor.id, unit.id, { floorPlanUrl: e.target.value })} 
                                   className="flex-1 bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-md p-2 text-[10px] text-white" 
                                 />
                                 <label className="cursor-pointer bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue p-2 rounded-md flex items-center justify-center transition-all">
                                   <Upload className="w-4 h-4" />
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => updateUnit(floor.id, unit.id, { floorPlanUrl: url }))} />
                                 </label>
                               </div>`;

const unitInputNew = `<div className="flex gap-2 mb-2 items-center">
                                 {unit.floorPlanUrl && <img src={unit.floorPlanUrl} className="w-6 h-6 object-cover rounded border border-white/10" />}
                                 <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 p-1.5 rounded-md flex items-center justify-center transition-all text-[10px] font-extrabold">
                                   <Upload className="w-3 h-3 mr-1" /> {unit.floorPlanUrl ? 'Change Unit Plan' : 'Upload Unit Plan'}
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => updateUnit(floor.id, unit.id, { floorPlanUrl: url }))} />
                                 </label>
                               </div>`;

code = code.replace(floorInputOld, floorInputNew);
code = code.replace(unitInputOld, unitInputNew);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log("Patched floor and unit inputs");
