const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { BuildingData, FloorData, UnitData } from './BuildingConfigurator';

interface InteractiveViewerProps {
  data: BuildingData;
}

const FLOOR_COLORS = [
  { base: 'rgba(59, 130, 246, 0.2)', hover: 'rgba(59, 130, 246, 0.4)', border: '#3b82f6' },
  { base: 'rgba(16, 185, 129, 0.2)', hover: 'rgba(16, 185, 129, 0.4)', border: '#10b981' },
  { base: 'rgba(139, 92, 246, 0.2)', hover: 'rgba(139, 92, 246, 0.4)', border: '#8b5cf6' },
  { base: 'rgba(236, 72, 153, 0.2)', hover: 'rgba(236, 72, 153, 0.4)', border: '#ec4899' },
  { base: 'rgba(245, 158, 11, 0.2)', hover: 'rgba(245, 158, 11, 0.4)', border: '#f59e0b' },
];

function ImageWithOverlay({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [bounds, setBounds] = React.useState({ top: 0, left: 0, width: 100, height: 100 });

  const updateBounds = React.useCallback(() => {
    if (imgRef.current && imgRef.current.naturalWidth) {
      const img = imgRef.current;
      const containerRatio = img.offsetWidth / img.offsetHeight;
      const imageRatio = img.naturalWidth / img.naturalHeight;
      let renderedWidth, renderedHeight;
      if (imageRatio > containerRatio) {
         renderedWidth = img.offsetWidth;
         renderedHeight = img.offsetWidth / imageRatio;
      } else {
         renderedHeight = img.offsetHeight;
         renderedWidth = img.offsetHeight * imageRatio;
      }
      setBounds({
         top: (img.offsetHeight - renderedHeight) / 2,
         left: (img.offsetWidth - renderedWidth) / 2,
         width: renderedWidth,
         height: renderedHeight
      });
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  return (
    <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white/5" style={{ lineHeight: 0 }}>
      <img 
        ref={imgRef}
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain rounded-2xl select-none"
        draggable={false}
        onLoad={updateBounds}
      />
      <div className="absolute pointer-events-auto" style={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}>
        {children}
      </div>
    </div>
  );
}

export default function InteractiveViewer({ data }: InteractiveViewerProps) {
  const [level, setLevel] = useState<'building' | 'floor' | 'unit'>('building');
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const activeFloor = data.floors.find(f => f.id === activeFloorId);
  const activeUnit = activeFloor?.units.find(u => u.id === activeUnitId);

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

  const handleFloorClick = (floor: FloorData) => {
    setActiveFloorId(floor.id);
    setLevel('floor');
    setHoveredPath(null);
  };

  const handleUnitClick = (unit: UnitData) => {
    setActiveUnitId(unit.id);
    setLevel('unit');
    setHoveredPath(null);
  };

  const goBack = () => {
    if (level === 'unit') {
      setLevel('floor');
      setActiveUnitId(null);
    } else if (level === 'floor') {
      setLevel('building');
      setActiveFloorId(null);
    }
  };

  return (
    <div className="w-full h-[85vh] bg-slate-950 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col relative font-sans">
        
        {/* Navigation Header */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center bg-slate-900/50 backdrop-blur-md shrink-0 relative z-10">
          <AnimatePresence mode="popLayout">
            {level !== 'building' && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={goBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-extrabold tracking-tight uppercase tracking-wider">
                  {level === 'unit' ? 'Back to Floor' : 'Back to Building'}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
          <div className="ml-auto text-sm font-extrabold tracking-tight text-white flex items-center gap-2 uppercase tracking-wider">
            <span className={level === 'building' ? 'text-brand-blue' : 'text-slate-500'}>Building</span>
            <ChevronLeft className="w-4 h-4 rotate-180 text-slate-700" />
            <span className={level === 'floor' ? 'text-brand-blue' : 'text-slate-500'}>Floor</span>
            <ChevronLeft className="w-4 h-4 rotate-180 text-slate-700" />
            <span className={level === 'unit' ? 'text-brand-blue' : 'text-slate-500'}>Unit</span>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 relative overflow-hidden bg-[#111]">
          <AnimatePresence mode="wait">
          
          {/* LEVEL 1: BUILDING EXTERIOR */}
          {level === 'building' && (
            <motion.div 
              key="building"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col md:flex-row absolute inset-0 overflow-y-auto md:overflow-hidden min-h-0 min-w-0"
            >
              <div className="w-full md:w-3/4 h-[50vh] md:h-full flex items-center justify-center p-4 md:p-8 relative bg-[#111] shrink-0 min-w-0 min-h-0 overflow-hidden">
                <ImageWithOverlay src={data.mainImageUrl} alt={data.name}>
                  <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {data.floors.map((floor, index) => {
                      const colorScheme = FLOOR_COLORS[index % FLOOR_COLORS.length];
                      return (
                        <path
                          key={floor.id}
                          d={floor.svgPath}
                          fill={hoveredPath === floor.id ? colorScheme.hover : colorScheme.base}
                          stroke={hoveredPath === floor.id ? colorScheme.border : "rgba(255,255,255,0.4)"}
                          strokeWidth="0.5"
                          vectorEffect="non-scaling-stroke"
                          className="cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredPath(floor.id)}
                          onMouseLeave={() => setHoveredPath(null)}
                          onClick={() => handleFloorClick(floor)}
                        />
                      );
                    })}
                  </svg>

                  {/* Floor Labels Overlay */}
                  {data.floors.map((floor, index) => {
                    const center = getPathCenter(floor.svgPath);
                    const isHovered = hoveredPath === floor.id;
                    const colorScheme = FLOOR_COLORS[index % FLOOR_COLORS.length];
                    
                    return (
                      <div 
                        key={"label-"+floor.id}
                        className="absolute pointer-events-none origin-center"
                        style={{ 
                          left: \`\${center.x}%\`, 
                          top: \`\${center.y}%\`, 
                          transform: \`translate(-50%, -50%) scale(\${isHovered ? 1.1 : 1})\`,
                          opacity: hoveredPath && !isHovered ? 0.3 : 1,
                          zIndex: isHovered ? 20 : 10
                        }}
                      >
                        <div 
                          className="bg-slate-900/80 backdrop-blur-md border text-white text-[10px] sm:text-xs font-extrabold tracking-tight px-2.5 py-1 sm:py-1.5 rounded-lg shadow-xl whitespace-nowrap transition-all duration-300 ease-in-out"
                          style={{ borderColor: isHovered ? colorScheme.border : 'rgba(255,255,255,0.2)' }}
                        >
                          {floor.name}
                        </div>
                      </div>
                    );
                  })}
                </ImageWithOverlay>
              </div>
              
              {/* Sidebar */}
              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink-0 flex-1 md:flex-none">
                <h3 className="text-brand-blue font-extrabold tracking-tight uppercase tracking-widest text-xs mb-4">Select a Floor</h3>
                <div className="space-y-3">
                  {data.floors.map((floor, index) => {
                    const colorScheme = FLOOR_COLORS[index % FLOOR_COLORS.length];
                    const isHovered = hoveredPath === floor.id;
                    
                    return (
                      <button
                        key={floor.id}
                        onClick={() => handleFloorClick(floor)}
                        onMouseEnter={() => setHoveredPath(floor.id)}
                        onMouseLeave={() => setHoveredPath(null)}
                        className={\`w-full text-left p-5 rounded-2xl border transition-all \${
                          isHovered ? 'bg-slate-800/80 backdrop-blur-xl scale-[1.02] shadow-xl' : 'bg-slate-900/90 backdrop-blur-2xl border-white/5'
                        }\`}
                        style={{ borderColor: isHovered ? colorScheme.border : undefined }}
                      >
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-extrabold tracking-tight text-white text-lg">{floor.name}</span>
                           <ChevronLeft className="w-5 h-5 rotate-180 opacity-50" />
                         </div>
                         <div className="text-slate-500 text-xs font-medium">
                           {floor.units.length} Units Available
                         </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 2: FLOOR PLAN */}
          {level === 'floor' && activeFloor && (
            <motion.div 
              key="floor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col md:flex-row absolute inset-0 overflow-y-auto md:overflow-hidden min-h-0 min-w-0"
            >
              <div className="w-full md:w-3/4 h-[50vh] md:h-full flex items-center justify-center p-4 md:p-8 relative bg-slate-950/50 shrink-0 min-w-0 min-h-0 overflow-hidden">
                <ImageWithOverlay src={activeFloor.floorPlanUrl} alt={activeFloor.name}>
                  <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {activeFloor.units.map(unit => (
                      <path
                        key={unit.id}
                        d={unit.svgPath}
                        fill={
                          hoveredPath === unit.id 
                            ? (unit.status === 'available' ? "rgba(16, 185, 129, 0.4)" : unit.status === 'reserved' ? "rgba(245, 158, 11, 0.4)" : "rgba(239, 68, 68, 0.4)")
                            : (unit.status === 'available' ? "rgba(16, 185, 129, 0.25)" : unit.status === 'reserved' ? "rgba(245, 158, 11, 0.25)" : "rgba(239, 68, 68, 0.25)")
                        }
                        stroke={
                          unit.status === 'available' ? "#10b981" : unit.status === 'reserved' ? "#f59e0b" : "#ef4444"
                        }
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredPath(unit.id)}
                        onMouseLeave={() => setHoveredPath(null)}
                        onClick={() => handleUnitClick(unit)}
                      />
                    ))}
                  </svg>
                  
                  {/* Unit Labels Overlay */}
                  {activeFloor.units.map(unit => {
                    const center = getPathCenter(unit.svgPath);
                    const isHovered = hoveredPath === unit.id;
                    const statusColor = unit.status === 'available' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                                      : unit.status === 'reserved' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                      : 'text-red-400 bg-red-400/10 border-red-400/20';
                    
                    return (
                      <div 
                        key={"ulabel-"+unit.id}
                        className="absolute pointer-events-none origin-center"
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
                </ImageWithOverlay>
              </div>
              
              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-8 md:overflow-y-auto custom-scrollbar shrink-0 md:shrink-0 flex-1 md:flex-none">
                <h3 className="text-brand-blue font-extrabold tracking-tight uppercase tracking-widest text-xs mb-4">Floor Units</h3>
                <div className="space-y-3">
                  {activeFloor.units.map(unit => (
                    <button
                      key={unit.id}
                      onClick={() => handleUnitClick(unit)}
                      onMouseEnter={() => setHoveredPath(unit.id)}
                      onMouseLeave={() => setHoveredPath(null)}
                      className={\`w-full text-left p-6 rounded-2xl border transition-all \${
                        hoveredPath === unit.id ? 'bg-slate-800/80 backdrop-blur-xl border-white/20 scale-[1.02] shadow-xl' : 'bg-slate-900/90 backdrop-blur-2xl border-white/5'
                      }\`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-extrabold tracking-tight text-white text-lg">{unit.name}</span>
                        <span className={\`text-[10px] uppercase tracking-widest font-extrabold tracking-tight px-2.5 py-1 rounded-full \${
                          unit.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          unit.status === 'reserved' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }\`}>
                          {unit.status}
                        </span>
                      </div>
                      {unit.specs && (
                        <div className="text-slate-500 text-xs flex gap-3 font-medium">
                           <span>{unit.specs.beds} Beds</span>
                           <span className="opacity-30">•</span>
                           <span>{unit.specs.baths} Baths</span>
                           <span className="opacity-30">•</span>
                           <span>{unit.specs.totalArea} m²</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 3: UNIT VIEW */}
          {level === 'unit' && activeUnit && (
            <motion.div 
              key="unit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-slate-950 overflow-y-auto md:overflow-hidden min-h-0 min-w-0"
            >
              <div className="w-full md:w-2/3 h-[50vh] md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-w-0 min-h-0 overflow-hidden">
                <div className="relative w-full h-full" style={{ lineHeight: 0 }}>
                  <img src={activeUnit.floorPlanUrl} alt={activeUnit.name} className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="w-full md:w-1/3 h-auto md:h-full p-8 md:p-10 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 md:overflow-y-auto shrink-0 md:shrink-0 flex-1 md:flex-none">
                <div className="mb-8">
                  <h3 className="text-4xl font-display font-extrabold tracking-tight text-white mb-4">{activeUnit.name}</h3>
                  <div className={\`inline-block px-6 py-1.5 rounded-full text-xs font-extrabold tracking-tight uppercase tracking-wider \${
                    activeUnit.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                    activeUnit.status === 'reserved' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                    'bg-red-500/20 text-red-400 border border-red-500/20'
                  }\`}>
                    {activeUnit.status}
                  </div>
                </div>
                {activeUnit.specs && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Bedrooms</p>
                      <p className="text-2xl font-medium text-white">{activeUnit.specs.beds}</p>
                    </div>
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Bathrooms</p>
                      <p className="text-2xl font-medium text-white">{activeUnit.specs.baths}</p>
                    </div>
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Total Area</p>
                      <p className="text-xl font-medium text-white">{activeUnit.specs.totalArea} <span className="text-sm text-slate-500">m²</span></p>
                    </div>
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Inside Area</p>
                      <p className="text-xl font-medium text-white">{activeUnit.specs.insideArea} <span className="text-sm text-slate-500">m²</span></p>
                    </div>
                    <div className="bg-slate-950 border border-white/5 p-6 md:p-5 rounded-2xl">
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Shared Area</p>
                      <p className="text-xl font-medium text-white">{activeUnit.specs.sharedArea} <span className="text-sm text-slate-500">m²</span></p>
                    </div>
                    <div className="bg-brand-blue/10 border border-brand-blue/20 p-6 md:p-5 rounded-2xl">
                      <p className="text-brand-blue text-[10px] uppercase tracking-widest font-extrabold tracking-tight mb-1">Price</p>
                      <p className="text-xl font-extrabold tracking-tight text-brand-blue">{activeUnit.specs.price}</p>
                    </div>
                  </div>
                )}
                <div className="mt-auto space-y-3">
                   <button className="w-full py-6 rounded-2xl font-extrabold tracking-tight bg-white text-brand-dark hover:bg-blue-600 hover:scale-[1.02] active:scale-95 hover:text-white transition-all duration-300 ease-in-out shadow-xl">
                     Request Information
                   </button>
                   <button className="w-full py-6 rounded-2xl font-extrabold tracking-tight bg-slate-800/80 backdrop-blur-xl text-white hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-in-out">
                     Download Brochure
                   </button>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
    </div>
  );
}
`;

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Rewrote InteractiveViewer!');
