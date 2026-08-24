const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

const targetStr = `                  </svg>
                </div>
              </div>
              
              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink-0 flex-1 md:flex-none">`;

const replacementStr = `                  </svg>
                  {/* Unit Labels Overlay */}
                  {activeFloor.units.map(unit => {
                    const center = getPathCenter(unit.svgPath);
                    const isHovered = hoveredPath === unit.id;
                    const statusColor = unit.status === 'available' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                                      : unit.status === 'reserved' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                      : 'text-red-400 bg-red-400/10 border-red-400/20';
                    const badgeBg = unit.status === 'available' ? 'bg-emerald-500' 
                                  : unit.status === 'reserved' ? 'bg-amber-500' 
                                  : 'bg-red-500';

                    return (
                      <div 
                        key={\`label-\${unit.id}\`}
                        className="absolute flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
                        style={{ 
                          left: \`\${center.x}%\`, 
                          top: \`\${center.y}%\`, 
                          transform: \`translate(-50%, -50%) scale(\${isHovered ? 1.1 : 1})\`,
                          opacity: hoveredPath && !isHovered ? 0.3 : 1,
                          zIndex: isHovered ? 20 : 10
                        }}
                      >
                        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-white/10 flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-white font-bold text-sm leading-none">{unit.name}</span>
                          <span className={\`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border \${statusColor}\`}>
                            {unit.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink-0 flex-1 md:flex-none">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('components/InteractiveViewer.tsx', code);
  console.log('Patched Unit Labels Overlay in InteractiveViewer');
} else {
  console.log('Target string not found for Unit Labels');
}
