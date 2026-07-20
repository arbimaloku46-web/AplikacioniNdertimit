import React, { useEffect } from 'react';
import { Project } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';

interface DashboardMapProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const BoundsFitter = ({ projects }: { projects: Project[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || projects.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    projects.forEach(p => {
      if (p.coordinates) {
        bounds.extend({ lat: p.coordinates.lat, lng: p.coordinates.lng });
      }
    });
    
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }, [map, projects]);
  
  return null;
};

export const DashboardMap: React.FC<DashboardMapProps> = ({ projects, onProjectClick }) => {
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);
  
  const mapCenter = { lat: 41.3275, lng: 19.8187 }; // Default center (Tirana)

  // Filter projects to only those with coordinates
  const mappedProjects = projects.filter(p => p.coordinates);

  if (mappedProjects.length === 0) {
     return null; // Return nothing if no projects have coordinates
  }

  if (!hasValidKey) {
    return (
      <div className="w-full h-96 rounded-3xl overflow-hidden border border-white/5 bg-slate-900 flex items-center justify-center text-center p-6 relative z-10 mt-12 mb-12">
        <div>
          <h2 className="text-white font-bold mb-2">Google Maps API Key Required for Dashboard Map</h2>
          <p className="text-sm text-slate-400 mb-2"><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-brand-blue hover:underline">Get an API Key</a></p>
          <div className="text-left text-xs text-slate-400 leading-relaxed">
            <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
            <ul className="list-disc pl-4 mt-1">
              <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
              <li>Paste your API key as the value, press <strong>Enter</strong></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-2xl mt-12 mb-12">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
             defaultCenter={mapCenter} 
             defaultZoom={11} 
             mapId="DEMO_MAP_ID_DARK"
             style={{ height: '100%', width: '100%', background: '#020617' }}
             internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
              <BoundsFitter projects={mappedProjects} />
              
              {mappedProjects.map((project) => (
                  <AdvancedMarker 
                      key={project.id} 
                      position={{ lat: project.coordinates!.lat, lng: project.coordinates!.lng }}
                      onClick={() => setActiveProject(project)}
                  >
                      <Pin background="#4285F4" glyphColor="#fff" borderColor="#1e3a8a" />
                  </AdvancedMarker>
              ))}

              {activeProject && activeProject.coordinates && (
                <InfoWindow 
                  position={{ lat: activeProject.coordinates.lat, lng: activeProject.coordinates.lng }}
                  onCloseClick={() => setActiveProject(null)}
                  pixelOffset={[0, -30]}
                >
                  <div className="p-1 min-w-[150px]">
                      <h4 className="font-display font-bold text-slate-800 text-sm mb-1">{activeProject.name}</h4>
                      <p className="text-xs text-slate-500 mb-3">{activeProject.location}</p>
                      <button 
                          onClick={() => onProjectClick(activeProject)}
                          className="w-full bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                          View Project
                      </button>
                  </div>
                </InfoWindow>
              )}
          </Map>
        </APIProvider>
    </div>
  );
};
