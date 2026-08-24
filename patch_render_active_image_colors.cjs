const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const oldUnitPaths = `{/* Existing paths for units */}
              {currentViewMode === 'floor' && activeFloorId && buildingData.floors.find(f => f.id === activeFloorId)?.units.map(u => (
                u.svgPath && (
                  <path 
                    key={u.id} 
                    d={u.svgPath} 
                    fill={(mode !== 'idle' && u.id === activeUnitId) ? "transparent" : (u.status === 'available' ? 'rgba(16,185,129,0.4)' : u.status === 'reserved' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)')} 
                    stroke={(mode !== 'idle' && u.id === activeUnitId) ? "transparent" : (u.status === 'available' ? '#10b981' : u.status === 'reserved' ? '#f59e0b' : '#ef4444')} 
                    strokeWidth="0.2" 
                    vectorEffect="non-scaling-stroke" 
                  />
                )
              ))}`;

const newUnitPaths = `{/* Existing paths for units */}
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
              })}`;

code = code.replace(oldUnitPaths, newUnitPaths);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log("Patched renderActiveImage unit colors");
