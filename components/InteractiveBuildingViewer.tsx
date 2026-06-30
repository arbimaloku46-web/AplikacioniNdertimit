import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InteractiveBuilding, Floor, Unit } from '../types';
import { X, ArrowLeft, Maximize2, Map } from 'lucide-react';

interface InteractiveBuildingViewerProps {
  building: InteractiveBuilding;
  onClose: () => void;
}

type ViewState = 'building' | 'floor' | 'unit';

export const InteractiveBuildingViewer: React.FC<InteractiveBuildingViewerProps> = ({ building, onClose }) => {
  const [viewState, setViewState] = useState<ViewState>('building');
  const [activeFloor, setActiveFloor] = useState<Floor | null>(null);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);

  const handleFloorClick = (floor: Floor) => {
    setActiveFloor(floor);
    setViewState('floor');
  };

  const handleUnitClick = (unit: Unit) => {
    setActiveUnit(unit);
    setViewState('unit');
  };

  const goBack = () => {
    if (viewState === 'unit') {
      setViewState('floor');
      setActiveUnit(null);
    } else if (viewState === 'floor') {
      setViewState('building');
      setActiveFloor(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[160] bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          {viewState !== 'building' && (
            <button 
              onClick={goBack}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-white text-xl font-display font-bold">
            {viewState === 'building' && "Interactive Model"}
            {viewState === 'floor' && `Floor Plan: ${activeFloor?.name}`}
            {viewState === 'unit' && `Unit: ${activeUnit?.name}`}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-4 pt-20">
        <AnimatePresence mode="wait">
          
          {/* Building View */}
          {viewState === 'building' && (
            <motion.div 
              key="building"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="relative inline-block max-w-full max-h-full">
                <img 
                  src={building.renderUrl} 
                  alt="Building Render" 
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                />
                
                {/* Floor Hitboxes */}
                {building.floors.map(floor => (
                  <button
                    key={floor.id}
                    onClick={() => handleFloorClick(floor)}
                    className="absolute group border-2 border-transparent hover:border-brand-blue bg-brand-blue/0 hover:bg-brand-blue/20 transition-all cursor-pointer rounded-lg"
                    style={{
                      left: `${floor.hitbox.x}%`,
                      top: `${floor.hitbox.y}%`,
                      width: `${floor.hitbox.width}%`,
                      height: `${floor.hitbox.height}%`,
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2 -top-8 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl transition-opacity">
                      {floor.name}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Floor Plan View */}
          {viewState === 'floor' && activeFloor && (
            <motion.div 
              key="floor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="relative inline-block max-w-full max-h-full bg-slate-900 rounded-3xl p-4 md:p-8">
                <img 
                  src={activeFloor.floorPlanUrl} 
                  alt={`${activeFloor.name} Floor Plan`} 
                  className="max-w-full max-h-[75vh] object-contain rounded-xl"
                />
                
                {/* Unit Hitboxes */}
                {activeFloor.units.map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => handleUnitClick(unit)}
                    className="absolute group border-2 border-transparent hover:border-emerald-400 bg-emerald-400/0 hover:bg-emerald-400/20 transition-all cursor-pointer rounded-lg flex items-center justify-center"
                    style={{
                      left: `${unit.hitbox.x}%`,
                      top: `${unit.hitbox.y}%`,
                      width: `${unit.hitbox.width}%`,
                      height: `${unit.hitbox.height}%`,
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-opacity flex flex-col items-center">
                      <span className="text-emerald-400 mb-1">{unit.name}</span>
                      <span className="text-slate-300 font-normal">{unit.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Unit View */}
          {viewState === 'unit' && activeUnit && (
            <motion.div 
              key="unit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Left side: Tour or Plan */}
              <div className="w-full md:w-2/3 h-[50vh] md:h-[70vh] bg-black relative">
                {activeUnit.virtualTourUrl ? (
                   <iframe 
                     src={activeUnit.virtualTourUrl} 
                     className="w-full h-full border-0"
                     allowFullScreen
                   />
                ) : activeUnit.detailsPlanUrl ? (
                  <img 
                    src={activeUnit.detailsPlanUrl} 
                    alt={`${activeUnit.name} Plan`} 
                    className="w-full h-full object-contain p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                    <Map className="w-12 h-12 opacity-50" />
                    <p>No 3D tour or detailed plan available.</p>
                  </div>
                )}
              </div>
              
              {/* Right side: Specs */}
              <div className="w-full md:w-1/3 p-6 md:p-10 flex flex-col bg-slate-950">
                <div className="mb-8">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">{activeUnit.name}</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeUnit.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                    activeUnit.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {activeUnit.status}
                  </div>
                </div>

                {activeUnit.specs && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900 p-4 rounded-2xl">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Beds</p>
                      <p className="text-2xl font-medium text-white">{activeUnit.specs.beds}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-2xl">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Baths</p>
                      <p className="text-2xl font-medium text-white">{activeUnit.specs.baths}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-2xl">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Area</p>
                      <p className="text-2xl font-medium text-white">{activeUnit.specs.area} m²</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-2xl">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Price</p>
                      <p className="text-lg font-medium text-brand-blue">{activeUnit.specs.price}</p>
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                   <button className="w-full py-4 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-600 transition-colors shadow-lg shadow-brand-blue/20">
                     Inquire About Unit
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
