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
    let currentViewMode = mode; // 'building' | 'floor' | 'unit' | 'idle'

    if (mode === 'idle') {
      if (activeUnitId && activeFloorId) {
        currentViewMode = 'unit';
      } else if (activeFloorId) {
        currentViewMode = 'floor';
      } else {
        currentViewMode = 'building';
      }
    }

    if (currentViewMode === 'building') {
      imageUrl = buildingData.mainImageUrl;
      instruction = mode === 'idle' ? "Previewing main building exterior." : "Click on the image to draw the polygon for the selected floor.";
    } else if (currentViewMode === 'floor' || mode === 'floor') {
      const floor = buildingData.floors.find(f => f.id === activeFloorId);
      imageUrl = floor?.floorPlanUrl || '';
      instruction = mode === 'idle' ? "Previewing floor plan and units." : "Click on the floor plan to draw the polygon for the selected unit.";
      currentViewMode = 'floor'; // force this mode for the SVG rendering below when mode === 'floor'
    } else if (currentViewMode === 'unit') {
      const floor = buildingData.floors.find(f => f.id === activeFloorId);
      const unit = floor?.units.find(u => u.id === activeUnitId);
      imageUrl = unit?.floorPlanUrl || '';
      instruction = "Previewing unit interior plan.";
    }

    return (
      <div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 min-w-0 h-full overflow-hidden">
        {imageUrl ? (
          <div className="relative inline-flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl shadow-2xl">
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Reference" 
              className={`block max-w-full max-h-full w-auto h-auto rounded-2xl select-none ${mode !== 'idle' ? 'cursor-crosshair' : ''}`} style={{ minHeight: 0, minWidth: 0 }}
              draggable={false}
              onClick={handleImageClick}
            />
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Existing paths for building */}
              {currentViewMode === 'building' && buildingData.floors.map(f => {
                const isBeingDrawn = mode !== 'idle' && f.id === activeFloorId;
                const isSelectedInIdle = mode === 'idle' && f.id === activeFloorId;
                
                let fill = "rgba(255,255,255,0.15)";
                let stroke = "rgba(255,255,255,0.4)";
                
                if (isBeingDrawn) {
                  fill = "transparent";
                  stroke = "transparent";
                } else if (isSelectedInIdle) {
                  fill = "rgba(59, 130, 246, 0.4)";
                  stroke = "#3b82f6";
                }

                return f.svgPath ? (
                  <path 
                    key={f.id} 
                    d={f.svgPath} 
                    fill={fill} 
                    stroke={stroke} 
                    strokeWidth="0.3" 
                    vectorEffect="non-scaling-stroke" 
                  />
                ) : null;
              })}
              
              {/* Existing paths for units */}
              {currentViewMode === 'floor' && activeFloorId && buildingData.floors.find(f => f.id === activeFloorId)?.units.map(u => {
                const isBeingDrawn = mode !== 'idle' && u.id === activeUnitId;
                const isSelectedInIdle = mode === 'idle' && u.id === activeUnitId;
                
                // Show status colors even when drawing OTHER units, to provide good context
                let fill = u.status === 'available' ? "rgba(16, 185, 129, 0.25)" 
                         : u.status === 'reserved' ? "rgba(245, 158, 11, 0.25)" 
                         : "rgba(239, 68, 68, 0.25)";
                let stroke = u.status === 'available' ? "#10b981" 
                           : u.status === 'reserved' ? "#f59e0b" 
                           : "#ef4444";
                
                if (isBeingDrawn) {
                  fill = "transparent";
                  stroke = "transparent";
                } else if (isSelectedInIdle) {
                  // highlight the selected unit in idle mode
                  fill = u.status === 'available' ? "rgba(16, 185, 129, 0.5)" 
                       : u.status === 'reserved' ? "rgba(245, 158, 11, 0.5)" 
                       : "rgba(239, 68, 68, 0.5)";
                }

                return u.svgPath ? (
                  <path 
                    key={u.id} 
                    d={u.svgPath} 
                    fill={fill} 
                    stroke={stroke} 
                    strokeWidth="0.3" 
                    vectorEffect="non-scaling-stroke" 
                  />
                ) : null;
              })}
              
              {/* Drawing Path */}
              {mode !== 'idle' && points.length > 0 && (
                <path d={currentSvgPath.replace(' Z', '')} fill="rgba(59, 130, 246, 0.4)" stroke="#3b82f6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              )}
              {mode !== 'idle' && points.map((p, i) => (
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
            <label className="block text-xs font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-2">Main Image</label>
            <div className="flex gap-3 items-center">
              {buildingData.mainImageUrl && <img src={buildingData.mainImageUrl} className="w-12 h-12 object-cover rounded-lg border border-white/10" />}
              <label className="flex-1 cursor-pointer bg-slate-950 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 p-3 rounded-lg flex items-center justify-center transition-all text-xs font-extrabold">
                <Upload className="w-4 h-4 mr-2" /> {buildingData.mainImageUrl ? 'Change Image' : 'Upload Image'}
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
                    onClick={() => { setActiveFloorId(activeFloorId === floor.id ? null : floor.id); setMode('idle'); setActiveUnitId(null); }}
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
                        <label className="block text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-wider mb-1">Floor Plan Image</label>
                        <div className="flex gap-2 items-center">
                          {floor.floorPlanUrl && <img src={floor.floorPlanUrl} className="w-8 h-8 object-cover rounded border border-white/10" />}
                          <label className="flex-1 cursor-pointer bg-slate-950 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 p-2 rounded-lg flex items-center justify-center transition-all text-[10px] font-extrabold">
                            <Upload className="w-3 h-3 mr-1" /> {floor.floorPlanUrl ? 'Change' : 'Upload'}
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
                             <div key={unit.id} className={`bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg p-3 ${activeUnitId === unit.id ? 'ring-1 ring-brand-blue' : ''}`}>
                               <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => { setActiveUnitId(activeUnitId === unit.id ? null : unit.id); setMode('idle'); }}>
                                  <input type="text" value={unit.name} onChange={e => updateUnit(floor.id, unit.id, { name: e.target.value })} onClick={e => e.stopPropagation()} className="bg-transparent border-none outline-none text-sm font-extrabold tracking-tight text-white w-2/3 focus:ring-1 focus:ring-brand-blue rounded px-1" />
                                  <button onClick={(e) => { e.stopPropagation(); deleteUnit(floor.id, unit.id); }} className="text-slate-500 hover:text-red-400 p-1"><X className="w-4 h-4" /></button>
                               </div>
                               <div className="flex gap-2 mb-2 items-center">
                                 {unit.floorPlanUrl && <img src={unit.floorPlanUrl} className="w-6 h-6 object-cover rounded border border-white/10" />}
                                 <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 p-1.5 rounded-md flex items-center justify-center transition-all text-[10px] font-extrabold">
                                   <Upload className="w-3 h-3 mr-1" /> {unit.floorPlanUrl ? 'Change Unit Plan' : 'Upload Unit Plan'}
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
