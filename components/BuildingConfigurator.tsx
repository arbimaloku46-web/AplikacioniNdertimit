import React, { useState, useRef } from 'react';
import { X, Undo, Check, Map, Plus, Trash2, ArrowLeft, Save, ChevronRight, ChevronDown } from 'lucide-react';
import { Project, InteractiveBuilding, Floor, Unit } from '../types';
import { dbService } from '../services/db';
import { Upload } from 'lucide-react';

interface BuildingConfiguratorProps {
  project: Project;
  onSave: (project: Project) => void;
  onClose: () => void;
}

type Mode = 'idle' | 'building' | 'floor' | 'unit';

export const BuildingConfigurator: React.FC<BuildingConfiguratorProps> = ({ project, onSave, onClose }) => {
  const [buildingData, setBuildingData] = useState<InteractiveBuilding>(
    project.interactiveBuilding || { mainImageUrl: '', floors: [] }
  );

  const [mode, setMode] = useState<Mode>('idle');
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
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
  };
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSave = () => {
    onSave({ ...project, interactiveBuilding: buildingData });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || mode === 'idle') return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints([...points, { x, y }]);
  };

  const currentSvgPath = points.length > 0 
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z'
    : '';

  const undoLastPoint = () => setPoints(points.slice(0, -1));
  const clearPoints = () => setPoints([]);

  const finishDrawing = () => {
    if (mode === 'building' && activeFloorId) {
      setBuildingData(prev => ({
        ...prev,
        floors: prev.floors.map(f => f.id === activeFloorId ? { ...f, svgPath: currentSvgPath } : f)
      }));
    } else if (mode === 'floor' && activeFloorId && activeUnitId) {
      setBuildingData(prev => ({
        ...prev,
        floors: prev.floors.map(f => f.id === activeFloorId ? {
          ...f,
          units: f.units.map(u => u.id === activeUnitId ? { ...u, svgPath: currentSvgPath } : u)
        } : f)
      }));
    }
    setMode('idle');
    setPoints([]);
  };

  const addFloor = () => {
    const newFloor: Floor = {
      id: `f_${Date.now()}`,
      name: `Floor ${buildingData.floors.length + 1}`,
      svgPath: '',
      floorPlanUrl: '',
      units: []
    };
    setBuildingData(prev => ({ ...prev, floors: [...prev.floors, newFloor] }));
    setActiveFloorId(newFloor.id);
  };

  const deleteFloor = (id: string) => {
    setBuildingData(prev => ({ ...prev, floors: prev.floors.filter(f => f.id !== id) }));
    if (activeFloorId === id) setActiveFloorId(null);
  };

  const updateFloor = (id: string, updates: Partial<Floor>) => {
    setBuildingData(prev => ({
      ...prev,
      floors: prev.floors.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const addUnit = (floorId: string) => {
    const floor = buildingData.floors.find(f => f.id === floorId);
    if (!floor) return;
    const newUnit: Unit = {
      id: `u_${Date.now()}`,
      name: `Unit ${floor.units.length + 1}`,
      svgPath: '',
      floorPlanUrl: '',
      specs: { beds: 0, baths: 0, totalArea: 0, insideArea: 0, sharedArea: 0, price: 'TBD' },
      status: 'available'
    };
    updateFloor(floorId, { units: [...floor.units, newUnit] });
    setActiveUnitId(newUnit.id);
  };

  const deleteUnit = (floorId: string, unitId: string) => {
    const floor = buildingData.floors.find(f => f.id === floorId);
    if (!floor) return;
    updateFloor(floorId, { units: floor.units.filter(u => u.id !== unitId) });
    if (activeUnitId === unitId) setActiveUnitId(null);
  };

  const updateUnit = (floorId: string, unitId: string, updates: Partial<Unit>) => {
    const floor = buildingData.floors.find(f => f.id === floorId);
    if (!floor) return;
    updateFloor(floorId, {
      units: floor.units.map(u => u.id === unitId ? { ...u, ...updates } : u)
    });
  };

  const renderActiveImage = () => {
    let imageUrl = '';
    let instruction = '';
    if (mode === 'idle') {
      imageUrl = buildingData.mainImageUrl;
      instruction = "Select a floor or unit to draw its boundaries, or upload images.";
    } else if (mode === 'building') {
      imageUrl = buildingData.mainImageUrl;
      instruction = "Click on the image to draw the polygon for the selected floor.";
    } else if (mode === 'floor') {
      const floor = buildingData.floors.find(f => f.id === activeFloorId);
      imageUrl = floor?.floorPlanUrl || '';
      instruction = "Click on the floor plan to draw the polygon for the selected unit.";
    }

    return (
      <div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-8 border border-white/5 shadow-inner min-h-[500px] lg:min-h-0 h-full overflow-hidden">
        {imageUrl ? (
          <div className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Reference" 
              className={`block w-auto h-auto max-w-full max-h-[75vh] select-none ${mode !== 'idle' ? 'cursor-crosshair' : ''}`}
              draggable={false}
              onClick={handleImageClick}
            />
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Show existing paths for context */}
              {mode === 'building' && buildingData.floors.map(f => (
                f.id !== activeFloorId && f.svgPath && (
                  <path key={f.id} d={f.svgPath} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                )
              ))}
              {mode === 'floor' && activeFloorId && buildingData.floors.find(f => f.id === activeFloorId)?.units.map(u => (
                u.id !== activeUnitId && u.svgPath && (
                  <path key={u.id} d={u.svgPath} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                )
              ))}
              
              {/* Drawing Path */}
              {points.length > 0 && (
                <path d={currentSvgPath.replace(' Z', '')} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              )}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="#fff" stroke="#3b82f6" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>

            {mode !== 'idle' && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-brand-blue/30 shadow-xl pointer-events-auto">
                <p className="text-white text-sm font-medium">{instruction}</p>
                <div className="flex gap-2">
                  <button onClick={undoLastPoint} disabled={points.length === 0} className="p-2 bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95 rounded-lg text-white disabled:opacity-50"><Undo className="w-4 h-4" /></button>
                  <button onClick={clearPoints} disabled={points.length === 0} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg disabled:opacity-50"><X className="w-4 h-4" /></button>
                  <button onClick={finishDrawing} className="px-6 py-2 bg-brand-blue hover:bg-blue-600 rounded-lg text-white font-extrabold tracking-tight flex items-center gap-2">
                    <Check className="w-4 h-4" /> Save Shape
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-500 max-w-sm">
            <Map className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>{instruction}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 text-white pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-white mb-2">Building Configurator</h2>
            <p className="text-slate-500">Map out {project.name}'s interactive building experience.</p>
         </div>
         <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95 rounded-2xl text-white font-medium transition-all duration-300 ease-in-out">Cancel</button>
            <button onClick={handleSave} className="px-8 py-2 bg-brand-blue hover:bg-blue-600 rounded-2xl text-white font-extrabold tracking-tight transition-all duration-300 ease-in-out shadow-lg shadow-brand-blue/20 flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Configuration
            </button>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-14rem)]">
        {/* Left Sidebar - Structure */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 h-full">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl">
            <h3 className="font-extrabold tracking-tight mb-4 text-brand-blue">Main Building</h3>
            <label className="block text-xs font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-2">Main Image URL</label>
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
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-extrabold tracking-tight text-brand-blue">Floors</h3>
               <button onClick={addFloor} className="p-1.5 bg-brand-blue/10 text-brand-blue hover:bg-blue-600 hover:scale-[1.02] active:scale-95 rounded-md transition-all duration-300 ease-in-out"><Plus className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-3">
              {buildingData.floors.map(floor => (
                <div key={floor.id} className="border border-white/5 rounded-2xl bg-slate-950 overflow-hidden">
                  <div 
                    className={`p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all duration-300 ease-in-out ${activeFloorId === floor.id ? 'bg-white/5' : ''}`}
                    onClick={() => setActiveFloorId(activeFloorId === floor.id ? null : floor.id)}
                  >
                    <span className="font-medium text-sm flex items-center gap-2">
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeFloorId === floor.id ? 'rotate-90' : ''}`} /> 
                      {floor.name}
                    </span>
                    <div className="flex items-center gap-1">
                       <div className={`w-2 h-2 rounded-full ${floor.svgPath ? 'bg-emerald-500' : 'bg-red-500/50'}`} title={floor.svgPath ? 'Mapped' : 'Unmapped'} />
                    </div>
                  </div>
                  
                  {activeFloorId === floor.id && (
                    <div className="p-6 border-t border-white/5 space-y-4 bg-slate-900/50">
                      <div>
                        <label className="block text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Name</label>
                        <input type="text" value={floor.name} onChange={e => updateFloor(floor.id, { name: e.target.value })} className="w-full bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-2 text-xs text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Plan Image URL</label>
                        <div className="flex gap-2">
                          <input type="text" value={floor.floorPlanUrl} onChange={e => updateFloor(floor.id, { floorPlanUrl: e.target.value })} className="flex-1 bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-2 text-xs text-white" />
                          <label className="cursor-pointer bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue p-2 rounded-lg flex items-center justify-center transition-all">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, url => updateFloor(floor.id, { floorPlanUrl: url }))} />
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setMode('building'); setPoints([]); }}
                          disabled={!buildingData.mainImageUrl}
                          className="flex-1 py-2 bg-brand-blue/20 text-brand-blue hover:bg-blue-600 hover:scale-[1.02] active:scale-95 rounded-lg text-xs font-extrabold tracking-tight transition-all duration-300 ease-in-out disabled:opacity-50"
                        >
                          {floor.svgPath ? 'Redraw Ext. Shape' : 'Draw Ext. Shape'}
                        </button>
                        <button onClick={() => deleteFloor(floor.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 ease-in-out"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      {/* Units */}
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                           <h4 className="text-xs font-extrabold tracking-tight text-slate-500">Units on {floor.name}</h4>
                           <button onClick={() => addUnit(floor.id)} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white font-medium">+ Add Unit</button>
                        </div>
                        <div className="space-y-2">
                          {floor.units.map(unit => (
                             <div key={unit.id} className="bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-3">
                               <div className="flex items-center justify-between mb-2">
                                  <input type="text" value={unit.name} onChange={e => updateUnit(floor.id, unit.id, { name: e.target.value })} className="bg-transparent border-none outline-none text-sm font-extrabold tracking-tight text-white w-2/3" />
                                  <button onClick={() => deleteUnit(floor.id, unit.id)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                               </div>
                               <div className="flex gap-2 mb-2">
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
                               </div>
                               <select 
                                 value={unit.status} 
                                 onChange={e => updateUnit(floor.id, unit.id, { status: e.target.value as any })}
                                 className="w-full bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-md p-1.5 text-[10px] text-white mb-2 outline-none"
                               >
                                 <option value="available">Available</option>
                                 <option value="reserved">Reserved</option>
                                 <option value="sold">Sold</option>
                               </select>
                               <button 
                                 onClick={() => { setActiveUnitId(unit.id); setMode('floor'); setPoints([]); }}
                                 disabled={!floor.floorPlanUrl}
                                 className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md text-[10px] font-extrabold tracking-tight transition-all duration-300 ease-in-out disabled:opacity-50"
                               >
                                 {unit.svgPath ? 'Redraw Unit Shape' : 'Draw Unit Shape'}
                               </button>
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Canvas */}
        {renderActiveImage()}
      </div>
    </div>
  );
};
