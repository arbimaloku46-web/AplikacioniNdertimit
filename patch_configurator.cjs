const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { Project, InteractiveBuilding, Floor, Unit } from '../types';",
  "import { Project, InteractiveBuilding, Floor, Unit } from '../types';\nimport { dbService } from '../services/db';\nimport { Upload } from 'lucide-react';"
);

// 2. Add isUploading state and handler
code = code.replace(
  "const [points, setPoints] = useState<{x: number, y: number}[]>([]);",
  `const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await dbService.uploadFile(file, project.id);
      callback(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };`
);

// 3. Update addUnit
code = code.replace(
  "specs: { beds: 0, baths: 0, area: 0, price: 'TBD' }",
  "specs: { beds: 0, baths: 0, totalArea: 0, insideArea: 0, sharedArea: 0, price: 'TBD' }"
);

// 4. Update the layout flex container to fix scrolling
code = code.replace(
  '<div className="flex flex-col lg:flex-row gap-8">',
  '<div className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-14rem)]">'
);
code = code.replace(
  '<div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">',
  '<div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 h-full">'
);
code = code.replace(
  '<div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl flex-1 overflow-y-auto">',
  '<div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl flex-1 overflow-y-auto min-h-0">'
);
code = code.replace(
  '<div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-8 border border-white/5 shadow-inner min-h-[500px]">',
  '<div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-8 border border-white/5 shadow-inner min-h-[500px] lg:min-h-0 h-full overflow-hidden">'
);

// 5. Update main image upload
code = code.replace(
  /<input \n              type="text" \n              value={buildingData\.mainImageUrl}/g,
  `<div className="flex gap-2">
              <input 
                type="text" 
                value={buildingData.mainImageUrl}`
);
code = code.replace(
  /className="w-full bg-slate-950 border border-white\/5 shadow-2xl shadow-black\/40 rounded-lg p-3 text-sm text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"\n            \/>\n          <\/div>/g,
  `className="flex-1 bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-3 text-sm text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
              />
              <label className="cursor-pointer bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue p-3 rounded-lg flex items-center justify-center transition-all">
                <Upload className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => setBuildingData(prev => ({ ...prev, mainImageUrl: url })))} />
              </label>
            </div>
          </div>`
);

// 6. Update floor plan upload
code = code.replace(
  /<div>\n                        <label className="block text-\[10px\] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Plan Image URL<\/label>\n                        <input type="text" value={floor\.floorPlanUrl} onChange={e => updateFloor\(floor\.id, { floorPlanUrl: e\.target\.value }\)} className="w-full bg-slate-950 border border-white\/5 shadow-2xl shadow-black\/40 rounded-lg p-2 text-xs text-white" \/>\n                      <\/div>/g,
  `<div>
                        <label className="block text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Plan Image URL</label>
                        <div className="flex gap-2">
                          <input type="text" value={floor.floorPlanUrl} onChange={e => updateFloor(floor.id, { floorPlanUrl: e.target.value })} className="flex-1 bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-2 text-xs text-white" />
                          <label className="cursor-pointer bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue p-2 rounded-lg flex items-center justify-center transition-all">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => updateFloor(floor.id, { floorPlanUrl: url }))} />
                          </label>
                        </div>
                      </div>`
);

// 7. Update unit fields
code = code.replace(
  /<input \n                                 type="text" \n                                 placeholder="Unit Plan URL" \n                                 value={unit\.floorPlanUrl} \n                                 onChange={e => updateUnit\(floor\.id, unit\.id, { floorPlanUrl: e\.target\.value }\)} \n                                 className="w-full bg-slate-900\/90 backdrop-blur-2xl border border-white\/5 rounded-md p-2 text-\[10px\] text-white mb-2" \n                               \/>/g,
  `<div className="flex gap-2 mb-2">
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
                               </div>
                               <div className="grid grid-cols-2 gap-2 mb-2">
                                 <div>
                                   <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Beds</label>
                                   <input type="number" value={unit.specs?.beds || 0} onChange={e => updateUnit(floor.id, unit.id, { specs: { ...unit.specs!, beds: Number(e.target.value) } })} className="w-full bg-slate-900/90 border border-white/5 rounded p-1 text-[10px] text-white" />
                                 </div>
                                 <div>
                                   <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Baths</label>
                                   <input type="number" value={unit.specs?.baths || 0} onChange={e => updateUnit(floor.id, unit.id, { specs: { ...unit.specs!, baths: Number(e.target.value) } })} className="w-full bg-slate-900/90 border border-white/5 rounded p-1 text-[10px] text-white" />
                                 </div>
                                 <div>
                                   <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Total Area (m²)</label>
                                   <input type="number" value={unit.specs?.totalArea || 0} onChange={e => updateUnit(floor.id, unit.id, { specs: { ...unit.specs!, totalArea: Number(e.target.value) } })} className="w-full bg-slate-900/90 border border-white/5 rounded p-1 text-[10px] text-white" />
                                 </div>
                                 <div>
                                   <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Inside (m²)</label>
                                   <input type="number" value={unit.specs?.insideArea || 0} onChange={e => updateUnit(floor.id, unit.id, { specs: { ...unit.specs!, insideArea: Number(e.target.value) } })} className="w-full bg-slate-900/90 border border-white/5 rounded p-1 text-[10px] text-white" />
                                 </div>
                                 <div>
                                   <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Shared (m²)</label>
                                   <input type="number" value={unit.specs?.sharedArea || 0} onChange={e => updateUnit(floor.id, unit.id, { specs: { ...unit.specs!, sharedArea: Number(e.target.value) } })} className="w-full bg-slate-900/90 border border-white/5 rounded p-1 text-[10px] text-white" />
                                 </div>
                                 <div>
                                   <label className="text-[9px] text-slate-500 font-bold uppercase mb-1 block">Price</label>
                                   <input type="text" value={unit.specs?.price || ''} onChange={e => updateUnit(floor.id, unit.id, { specs: { ...unit.specs!, price: e.target.value } })} className="w-full bg-slate-900/90 border border-white/5 rounded p-1 text-[10px] text-white" />
                                 </div>
                               </div>`
);


fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log("Patched BuildingConfigurator.tsx");
