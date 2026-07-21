import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface LocationPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const API_KEY = 
  process.env.GOOGLE_MAPS_PLATFORM_KEY || 
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || 
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || 
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialPosition, onLocationSelect, readOnly = false }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const defaultCenter = { lat: 41.3275, lng: 19.8187 }; // Tirana center as default

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/geocode-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (!res.ok) {
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.error || await res.text());
      }
      const data = await res.json();
      if (data.lat && data.lng) {
        setPosition(data);
        if (onLocationSelect) onLocationSelect(data.lat, data.lng);
      }
    } catch (err: any) {
      alert("Failed to find location: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const openGoogleMaps = () => {
    if (position) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`, '_blank');
    }
  };

  if (!hasValidKey) {
    return (
      <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center text-center p-8 relative z-10">
        <div>
          <h2 className="text-white font-extrabold tracking-tight mb-2">Google Maps API Key Required</h2>
          <p className="text-sm text-slate-500 mb-2"><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-brand-blue hover:underline">Get an API Key</a></p>
          <div className="text-left text-xs text-slate-500 leading-relaxed">
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
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40 relative z-10 group">
      {!readOnly && (
        <form onSubmit={handleSearch} className="absolute top-4 left-4 right-14 z-[400] flex gap-2 max-w-sm">
          <input 
            type="text" 
            placeholder="AI Location Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl border border-white/20 outline-none focus:ring-2 focus:ring-brand-blue placeholder:text-slate-500"
          />
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-extrabold tracking-tight shadow-xl hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-brand-blue transition-all flex items-center justify-center min-w-[70px]"
          >
            {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-brand-blue rounded-full animate-spin" /> : "Find"}
          </button>
        </form>
      )}

      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={initialPosition || defaultCenter}
          center={position || defaultCenter}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={readOnly}
          gestureHandling={readOnly ? 'cooperative' : 'auto'}
          onClick={(e) => {
            if (!readOnly && e.detail.latLng) {
              const lat = e.detail.latLng.lat;
              const lng = e.detail.latLng.lng;
              setPosition({ lat, lng });
              if (onLocationSelect) onLocationSelect(lat, lng);
            }
          }}
        >
          {position && (
            <AdvancedMarker position={position}>
              <Pin background="#4285F4" glyphColor="#fff" borderColor="#1e3a8a" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {readOnly && position && (
        <button 
          onClick={openGoogleMaps}
          className="absolute bottom-4 left-4 z-[400] bg-white text-slate-900 px-6 py-2 rounded-lg font-extrabold tracking-tight text-sm shadow-xl hover:bg-blue-600 hover:scale-[1.02] active:scale-95 hover:text-white transition-all duration-300 ease-in-out flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Open in Google Maps
        </button>
      )}
    </div>
  );
};
