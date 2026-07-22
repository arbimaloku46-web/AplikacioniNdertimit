import React, { useEffect } from 'react';
import { Project } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DashboardMapProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const BoundsFitter = ({ projects }: { projects: Project[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || projects.length === 0) return;
    
    const bounds = L.latLngBounds([]);
    projects.forEach(p => {
      if (p.coordinates) {
        bounds.extend([p.coordinates.lat, p.coordinates.lng]);
      }
    });
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, projects]);
  
  return null;
};

export const DashboardMap: React.FC<DashboardMapProps> = ({ projects, onProjectClick }) => {
  const mapCenter = { lat: 41.3275, lng: 19.8187 }; // Default center (Tirana)

  // Filter projects to only those with coordinates
  const mappedProjects = projects.filter(p => p.coordinates);

  if (mappedProjects.length === 0) { 
    return null; // Return nothing if no projects have coordinates
  }

  if (!hasValidKey) {
    return (
      <div className="w-full h-96 rounded-3xl overflow-hidden border border-white/5 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center text-center p-8 relative z-10 mt-12 mb-12">
        <div>
          <h2 className="text-white font-extrabold tracking-tight mb-2">MapTiler API Key Required for Dashboard Map</h2>
          <div className="text-left text-xs text-slate-500 leading-relaxed">
            <p><strong>Step 1:</strong> Add your key as a secret in AI Studio:</p>
            <ul className="list-disc pl-4 mt-1">
              <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Type <code>MAPTILER_API_KEY</code> as the secret name, press <strong>Enter</strong></li>
              <li>Paste your API key as the value, press <strong>Enter</strong></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-2xl mt-12 mb-12">
      <MapContainer 
        center={mapCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
          url={`https://api.maptiler.com/maps/basic-v2-dark/{z}/{x}/{y}.png?key=${API_KEY}`}
        />
        <BoundsFitter projects={mappedProjects} />
        
        {mappedProjects.map((project) => (
          <Marker 
            key={project.id} 
            position={[project.coordinates!.lat, project.coordinates!.lng]}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[150px]">
                  <h4 className="font-display font-extrabold tracking-tight text-slate-800 text-sm mb-1">{project.name}</h4>
                  <p className="text-xs text-slate-500 mb-3">{project.location}</p>
                  <button 
                      onClick={() => onProjectClick(project)}
                      className="w-full bg-brand-blue text-white text-[10px] font-extrabold tracking-tight uppercase tracking-widest py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 ease-in-out"
                  >
                      View Project
                  </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
