import React, { useState } from 'react';
import { ArrowLeft, Map, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UnitData {
  id: string;
  name: string;
  status: 'available' | 'sold' | 'reserved';
  floorPlanUrl: string;
  svgPath: string;
  specs?: {
    beds: number;
    baths: number;
    totalArea: number;
    insideArea: number;
    sharedArea: number;
    price: string;
  };
}

export interface FloorData {
  id: string;
  name: string;
  floorPlanUrl: string;
  svgPath: string;
  units: UnitData[];
}

export interface BuildingData {
  id: string;
  name: string;
  mainImageUrl: string;
  floors: FloorData[];
}

interface InteractiveViewerProps {
  data: BuildingData;
  onClose?: () => void;
}

type ViewLevel = 'exterior' | 'floor' | 'unit';

const getPathCenter = (pathStr: string) => {
  const points = pathStr.match(/-?\d+\.?\d*/g);
  if (!points || points.length < 2) return { x: 50, y: 50 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    const x = parseFloat(points[i]);
    const y = parseFloat(points[i + 1]);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
};

const FLOOR_COLORS = [
  { base: 'rgba(59, 130, 246, 0.25)', hover: 'rgba(59, 130, 246, 0.5)', border: '#3b82f6' }, // blue
  { base: 'rgba(16, 185, 129, 0.25)', hover: 'rgba(16, 185, 129, 0.5)', border: '#10b981' }, // emerald
  { base: 'rgba(245, 158, 11, 0.25)', hover: 'rgba(245, 158, 11, 0.5)', border: '#f59e0b' }, // amber
  { base: 'rgba(168, 85, 247, 0.25)', hover: 'rgba(168, 85, 247, 0.5)', border: '#a855f7' }, // purple
  { base: 'rgba(236, 72, 153, 0.25)', hover: 'rgba(236, 72, 153, 0.5)', border: '#ec4899' }, // pink
];

export const InteractiveViewer: React.FC<InteractiveViewerProps> = ({ data, onClose }) => {
  const [level, setLevel] = useState<ViewLevel>('exterior');
  const [activeFloor, setActiveFloor] = useState<FloorData | null>(null);
  const [activeUnit, setActiveUnit] = useState<UnitData | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleFloorClick = (floor: FloorData) => {
    setActiveFloor(floor);
    setLevel('floor');
    setHoveredPath(null);
  };

  const handleUnitClick = (unit: UnitData) => {
    setActiveUnit(unit);
    setLevel('unit');
    setHoveredPath(null);
  };

  const goBackToExterior = () => {
    setLevel('exterior');
    setActiveFloor(null);
    setActiveUnit(null);
    setHoveredPath(null);
  };

  const goBackToFloor = () => {
    setLevel('floor');
    setActiveUnit(null);
    setHoveredPath(null);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 text-white border-b border-white/10 shrink-0 bg-slate-950 z-20">
        <div>
          <h2 className="font-display font-bold tracking-tight text-lg md:text-xl flex items-center gap-2">
            <Map className="w-5 h-5 md:w-6 md:h-6 text-brand-blue" />
            {level === 'exterior' && data.name}
            {level === 'floor' && `Floor Plan: ${activeFloor?.name}`}
            {level === 'unit' && `Unit: ${activeUnit?.name}`}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ease-in-out"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full bg-slate-900/90 backdrop-blur-2xl overflow-hidden flex flex-col relative flex-1">
        {/* Navigation Header */}
        <div className="bg-slate-950 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-white/5 z-10 relative">
        <div className="flex items-center gap-6">
          <AnimatePresence mode="popLayout">
            {level !== 'exterior' && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={level === 'unit' ? goBackToFloor : goBackToExterior}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all duration-300 ease-in-out flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> 
                {level === 'unit' ? 'Back to Floor Plan' : 'Back to Exterior'}
              </motion.button>
            )}
          </AnimatePresence>
          <h2 className="text-xl font-extrabold tracking-tight text-white tracking-tight">
            {level === 'exterior' ? data.name : level === 'floor' ? activeFloor?.name : activeUnit?.name}
          </h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex bg-slate-900/50 min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* LEVEL 1: EXTERIOR */}
          {level === 'exterior' && (
            <motion.div 
              key="exterior"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0"
            >
              <div className="relative inline-block max-w-full max-h-full">
                <img 
                  src={data.mainImageUrl} 
                  alt={data.name} 
                  className="w-full h-[85vh] object-contain drop-shadow-2xl"
                />
                <svg 
                  className="absolute top-0 left-0 w-full h-full" 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                >
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
                      key={`label-${floor.id}`}
                      className="absolute flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
                      style={{ 
                        left: `${center.x}%`, 
                        top: `${center.y}%`, 
                        transform: `translate(-50%, -50%) scale(${isHovered ? 1.1 : 1})`,
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
                
                {/* Custom Tooltip overlay for floors */}
                <div className="absolute top-4 right-4 pointer-events-none">
                   <AnimatePresence>
                      {hoveredPath && data.floors.find(f => f.id === hoveredPath) && (
                         <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="bg-slate-900/90 backdrop-blur-md border border-brand-blue/30 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
                         >
                           <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-extrabold tracking-tight">
                             {data.floors.find(f => f.id === hoveredPath)?.name.replace(/[^0-9]/g, '') || 'F'}
                           </div>
                           <div>
                             <p className="font-extrabold tracking-tight">{data.floors.find(f => f.id === hoveredPath)?.name}</p>
                             <p className="text-xs text-slate-500">Click to view units</p>
                           </div>
                         </motion.div>
                      )}
                   </AnimatePresence>
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
              className="w-full h-full flex flex-col md:flex-row absolute inset-0 overflow-y-auto md:overflow-hidden"
            >
              <div className="w-full md:w-3/4 h-auto md:h-full flex items-center justify-center relative bg-slate-950/50 shrink-0 min-h-[50vh] md:min-h-0">
                <div className="relative inline-block max-w-full max-h-full">
                  <img 
                    src={activeFloor.floorPlanUrl} 
                    alt={activeFloor.name} 
                    className="w-full h-[85vh] object-contain shadow-2xl bg-white"
                  />
                  <svg 
                    className="absolute top-0 left-0 w-full h-full" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    {activeFloor.units.map(unit => (
                      <path
                        key={unit.id}
                        d={unit.svgPath}
                        fill={
                          hoveredPath === unit.id 
                            ? (unit.status === 'available' ? "rgba(16, 185, 129, 0.4)" : unit.status === 'reserved' ? "rgba(245, 158, 11, 0.4)" : "rgba(239, 68, 68, 0.4)")
                            : (unit.status === 'available' ? "rgba(16, 185, 129, 0.15)" : unit.status === 'reserved' ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)")
                        }
                        stroke={
                          hoveredPath === unit.id 
                            ? (unit.status === 'available' ? "#10b981" : unit.status === 'reserved' ? "#f59e0b" : "#ef4444")
                            : "transparent"
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
                </div>
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
                      className={`w-full text-left p-6 rounded-2xl border transition-all ${
                        hoveredPath === unit.id ? 'bg-slate-800/80 backdrop-blur-xl border-white/20 scale-[1.02] shadow-xl' : 'bg-slate-900/90 backdrop-blur-2xl border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-extrabold tracking-tight text-white text-lg">{unit.name}</span>
                        <span className={`text-[10px] uppercase tracking-widest font-extrabold tracking-tight px-2.5 py-1 rounded-full ${
                          unit.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          unit.status === 'reserved' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
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
              className="w-full h-full flex flex-col md:flex-row absolute inset-0 bg-slate-950 overflow-y-auto md:overflow-hidden"
            >
              <div className="w-full md:w-2/3 h-auto md:h-full p-2 md:p-4 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0">
                <img 
                  src={activeUnit.floorPlanUrl} 
                  alt={activeUnit.name} 
                  className="w-full h-[85vh] object-contain drop-shadow-2xl"
                />
              </div>
              <div className="w-full md:w-1/3 h-auto md:h-full p-8 md:p-10 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 md:overflow-y-auto shrink-0 md:shrink-0 flex-1 md:flex-none">
                <div className="mb-8">
                  <h3 className="text-4xl font-display font-extrabold tracking-tight text-white mb-4">{activeUnit.name}</h3>
                  <div className={`inline-block px-6 py-1.5 rounded-full text-xs font-extrabold tracking-tight uppercase tracking-wider ${
                    activeUnit.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                    activeUnit.status === 'reserved' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                    'bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}>
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
    </div>
  );
};
