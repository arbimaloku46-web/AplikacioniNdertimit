import React, { useState } from 'react';
import { Project, InteractiveBuilding, Floor, Unit } from '../types';
import { Check, X, Plus, Trash2, Undo, Save, ChevronRight, Map } from 'lucide-react';

interface BuildingConfiguratorProps {
  project: Project;
  onSave: (buildingData: InteractiveBuilding) => Promise<void>;
  onClose: () => void;
}

export const BuildingConfigurator: React.FC<BuildingConfiguratorProps> = ({ project, onSave, onClose }) => {
  const [buildingData, setBuildingData] = useState<InteractiveBuilding>(
    project.interactiveBuilding || { mainImageUrl: '', floors: [] }
  );

  const handleSave = async () => {
    await onSave(buildingData);
  };

  const addFloor = () => {
    setBuildingData(prev => ({
      ...prev,
      floors: [...prev.floors, {
        id: Math.random().toString(36).substr(2, 9),
        name: `Floor ${prev.floors.length + 1}`,
        svgPath: '',
        floorPlanUrl: '',
        units: []
      }]
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 text-white pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Building Configurator</h2>
          <p className="text-slate-500">Map out {project.name}'s interactive building experience.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 rounded-md">Cancel</button>
          <button onClick={handleSave} className="px-8 py-2 bg-brand-blue rounded-md flex items-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
      <div className="flex gap-8">
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
          <div className="bg-slate-900 border border-white/5 p-5 rounded-md">
            <label className="block text-xs mb-2">Main Image URL</label>
            <input 
              value={buildingData.mainImageUrl} 
              onChange={e => setBuildingData(p => ({ ...p, mainImageUrl: e.target.value }))}
              className="w-full bg-slate-950 border border-white/5 p-2 rounded-md"
            />
          </div>
          <div className="bg-slate-900 border border-white/5 p-5 rounded-md">
             <div className="flex justify-between items-center mb-4">
               <h3>Floors</h3>
               <button onClick={addFloor}><Plus className="w-4 h-4" /></button>
             </div>
             {buildingData.floors.map((floor, i) => (
                <div key={floor.id} className="mb-2 p-3 bg-slate-950 rounded-md border border-white/5">
                  <input 
                    value={floor.name}
                    onChange={e => {
                       const floors = [...buildingData.floors];
                       floors[i].name = e.target.value;
                       setBuildingData({ ...buildingData, floors });
                    }}
                    className="w-full bg-transparent border-none text-white text-sm outline-none"
                  />
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
