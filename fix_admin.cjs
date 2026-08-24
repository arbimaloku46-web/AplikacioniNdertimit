const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

// I will do string replacement for the entire renderActiveImage block.
const startIndex = code.indexOf('  const renderActiveImage = () => {');
const endIndexStr = '  return (\n    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 text-white pb-20">';
const endIndex = code.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newRenderFunc = `  const renderActiveImage = () => {
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

    // Helper to calculate center of path for labels
    const getPathCenter = (pathData: string) => {
      const points = pathData.replace('M', '').replace('Z', '').trim().split('L').map(p => {
        const [x, y] = p.trim().split(' ').map(Number);
        return { x, y };
      }).filter(p => !isNaN(p.x) && !isNaN(p.y));
      if (points.length === 0) return { x: 50, y: 50 };
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));
      return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
    };

    return (
      <div className="flex-1 bg-slate-950 rounded-2xl border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 min-w-0 h-full overflow-hidden flex flex-col relative">
        {imageUrl ? (
          <div className="w-full h-full overflow-auto custom-scrollbar relative bg-[#111]">
            <div 
              className="flex items-center justify-center p-4 md:p-8 transition-all duration-300 origin-center"
              style={{ 
                minWidth: '100%', 
                minHeight: '100%',
                width: zoomLevel > 1 ? \`\${100 * zoomLevel}%\` : '100%',
                height: zoomLevel > 1 ? \`\${100 * zoomLevel}%\` : '100%'
              }}
            >
              <div className="relative inline-block max-w-full max-h-full rounded-2xl shadow-2xl" style={{ lineHeight: 0 }}>
                <img 
                  ref={imgRef}
                  src={imageUrl} 
                  alt="Reference" 
                  className={\`block max-w-full max-h-full w-auto h-auto rounded-2xl select-none \${mode !== 'idle' ? 'cursor-crosshair' : ''}\`} 
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

                {/* Unit Labels overlay for Admin */}
                {currentViewMode === 'floor' && activeFloorId && mode === 'idle' && buildingData.floors.find(f => f.id === activeFloorId)?.units.map(u => {
                  if(!u.svgPath) return null;
                  const center = getPathCenter(u.svgPath);
                  const isSelected = activeUnitId === u.id;
                  const statusColor = u.status === 'available' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                                    : u.status === 'reserved' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                    : 'text-red-400 bg-red-400/10 border-red-400/20';
                  
                  return (
                    <div 
                      key={\`label-\${u.id}\`}
                      className="absolute flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
                      style={{ 
                        left: \`\${center.x}%\`, 
                        top: \`\${center.y}%\`, 
                        transform: \`translate(-50%, -50%) scale(\${isSelected ? 1.1 : 1})\`,
                        zIndex: isSelected ? 20 : 10
                      }}
                    >
                      <div className="bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-xl border border-white/10 flex flex-col items-center gap-0.5">
                        <span className="text-white font-bold text-xs leading-none">{u.name}</span>
                        <span className={\`text-[8px] font-extrabold uppercase tracking-wider px-1 py-0.5 rounded border \${statusColor}\`}>
                          {u.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl z-20">
              <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))} className="p-2 text-white hover:bg-white/10 rounded-lg"><Minus className="w-4 h-4" /></button>
              <span className="text-white text-xs font-bold w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))} className="p-2 text-white hover:bg-white/10 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>

            {mode !== 'idle' && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-brand-blue/30 shadow-xl pointer-events-auto z-20">
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
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <Map className="w-16 h-16 mb-4 opacity-20" />
            <p>{instruction}</p>
          </div>
        )}
      </div>
    );
  };

`;

  const finalCode = code.substring(0, startIndex) + newRenderFunc + code.substring(endIndex);
  fs.writeFileSync('components/BuildingConfigurator.tsx', finalCode);
  console.log('Patched Admin renderActiveImage');
} else {
  console.log('Could not find replace block', startIndex, endIndex);
}
