const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const oldStr = `            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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
              
              {/* Drawing Path */}`;

const newStr = `            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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
              
              {/* Drawing Path */}`;

if (code.includes(oldStr)) {
    code = code.replace(oldStr, newStr);
    fs.writeFileSync('components/BuildingConfigurator.tsx', code);
    console.log('Patched SVG rendering in BuildingConfigurator');
} else {
    console.log('Could not find SVG rendering block');
}
