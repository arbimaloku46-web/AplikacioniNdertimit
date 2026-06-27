import React from 'react';
import { Project } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DashboardMapProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  unlockedProjectIds: string[];
  isAdmin: boolean;
}

export const DashboardMap: React.FC<DashboardMapProps> = ({ projects, onProjectClick, unlockedProjectIds, isAdmin }) => {
  const mapCenter = { lat: 41.3275, lng: 19.8187 }; // Default center (Tirana)

  // Filter projects to only those with coordinates
  const mappedProjects = projects.filter(p => p.coordinates);

  if (mappedProjects.length === 0) {
     return null; // Return nothing if no projects have coordinates
  }

  // Calculate bounds if we have projects
  const bounds = mappedProjects.length > 0 ? L.latLngBounds(mappedProjects.map(p => [p.coordinates!.lat, p.coordinates!.lng])) : undefined;

  return (
    <div className="w-full h-96 rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-2xl mt-12 mb-12">
        <MapContainer 
           center={mapCenter} 
           zoom={11} 
           style={{ height: '100%', width: '100%', background: '#020617' }}
           bounds={bounds}
           boundsOptions={{ padding: [50, 50] }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {mappedProjects.map((project) => {
                return (
                    <Marker 
                        key={project.id} 
                        position={{ lat: project.coordinates!.lat, lng: project.coordinates!.lng }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <h4 className="font-display font-bold text-slate-800 text-sm mb-1">{project.name}</h4>
                                <p className="text-xs text-slate-500 mb-3">{project.location}</p>
                                <button 
                                    onClick={() => onProjectClick(project)}
                                    className="w-full bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    View Project
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
        <style>{`
            .leaflet-popup-content-wrapper {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
            }
            .leaflet-popup-tip {
                background: white;
            }
        `}</style>
    </div>
  );
};
