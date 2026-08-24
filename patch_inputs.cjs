const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const mainInputOld = `<label className="block text-xs font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-2">Main Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={buildingData.mainImageUrl}
              onChange={e => setBuildingData(prev => ({ ...prev, mainImageUrl: e.target.value }))}
              placeholder="https://..."
              className="flex-1 bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-3 text-sm text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
              />
              <label className="cursor-pointer bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue p-3 rounded-lg flex items-center justify-center transition-all">
                <Upload className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => setBuildingData(prev => ({ ...prev, mainImageUrl: url })))} />
              </label>
            </div>`;

const mainInputNew = `<label className="block text-xs font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-2">Main Image</label>
            <div className="flex gap-3 items-center">
              {buildingData.mainImageUrl && <img src={buildingData.mainImageUrl} className="w-12 h-12 object-cover rounded-lg border border-white/10" />}
              <label className="flex-1 cursor-pointer bg-slate-950 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 p-3 rounded-lg flex items-center justify-center transition-all text-xs font-extrabold">
                <Upload className="w-4 h-4 mr-2" /> {buildingData.mainImageUrl ? 'Change Image' : 'Upload Image'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => setBuildingData(prev => ({ ...prev, mainImageUrl: url })))} />
              </label>
            </div>`;

code = code.replace(mainInputOld, mainInputNew);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log("Patched main input");
