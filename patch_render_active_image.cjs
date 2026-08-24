const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const oldStr = `  const renderActiveImage = () => {
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
      <div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 h-full overflow-hidden">
        {imageUrl ? (
          <div className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl">
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Reference" 
              className={\`block max-w-full max-h-full w-auto h-auto object-contain rounded-2xl select-none \${mode !== 'idle' ? 'cursor-crosshair' : ''}\`}
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
          </div>
        ) : (
          <div className="text-slate-500 text-sm flex flex-col items-center">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>{instruction}</p>
          </div>
        )}
      </div>
    );
  };`;

const newStr = `  const renderActiveImage = () => {
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
      <div className="flex-1 bg-slate-950 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 border border-white/5 shadow-inner min-h-[60vh] lg:min-h-0 h-full overflow-hidden">
        {imageUrl ? (
          <div className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl">
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Reference" 
              className={\`block max-w-full max-h-full w-auto h-auto object-contain rounded-2xl select-none \${mode !== 'idle' ? 'cursor-crosshair' : ''}\`}
              draggable={false}
              onClick={handleImageClick}
            />
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Existing paths for building */}
              {currentViewMode === 'building' && buildingData.floors.map(f => (
                f.svgPath && (
                  <path 
                    key={f.id} 
                    d={f.svgPath} 
                    fill={(mode !== 'idle' && f.id === activeFloorId) ? "transparent" : (mode === 'idle' && f.id === activeFloorId ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.1)")} 
                    stroke={(mode !== 'idle' && f.id === activeFloorId) ? "transparent" : (mode === 'idle' && f.id === activeFloorId ? "#3b82f6" : "rgba(255,255,255,0.3)")} 
                    strokeWidth="0.2" 
                    vectorEffect="non-scaling-stroke" 
                  />
                )
              ))}
              
              {/* Existing paths for units */}
              {currentViewMode === 'floor' && activeFloorId && buildingData.floors.find(f => f.id === activeFloorId)?.units.map(u => {
                let fill = "rgba(255,255,255,0.1)";
                let stroke = "rgba(255,255,255,0.3)";
                
                if (mode === 'idle') {
                  const isHovered = activeUnitId === u.id; // Treat selected as hovered for preview
                  fill = isHovered 
                    ? (u.status === 'available' ? "rgba(16, 185, 129, 0.4)" : u.status === 'reserved' ? "rgba(245, 158, 11, 0.4)" : "rgba(239, 68, 68, 0.4)")
                    : (u.status === 'available' ? "rgba(16, 185, 129, 0.25)" : u.status === 'reserved' ? "rgba(245, 158, 11, 0.25)" : "rgba(239, 68, 68, 0.25)");
                  stroke = u.status === 'available' ? "#10b981" : u.status === 'reserved' ? "#f59e0b" : "#ef4444";
                } else if (u.id === activeUnitId) {
                  fill = "transparent";
                  stroke = "transparent";
                }

                return u.svgPath ? (
                  <path 
                    key={u.id} 
                    d={u.svgPath} 
                    fill={fill} 
                    stroke={stroke} 
                    strokeWidth="0.2" 
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
          </div>
        ) : (
          <div className="text-slate-500 text-sm flex flex-col items-center">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>{instruction}</p>
          </div>
        )}
      </div>
    );
  };`;

if (code.includes('const renderActiveImage = () => {')) {
    code = code.replace(oldStr, newStr);
    fs.writeFileSync('components/BuildingConfigurator.tsx', code);
    console.log('Patched renderActiveImage');
} else {
    console.log('Could not find renderActiveImage');
}
