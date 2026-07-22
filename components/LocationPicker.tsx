import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const API_KEY = '2XSQoYHYmYcpza7rCRwj';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function LocationMarker({ position, setPosition, onLocationSelect, readOnly }: any) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition(e.latlng);
        if (onLocationSelect) onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

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

  const openMap = () => {
    if (position) {
      window.open(`https://www.openstreetmap.org/?mlat=${position.lat}&mlon=${position.lng}#map=15/${position.lat}/${position.lng}`, '_blank');
    }
  };

  if (!hasValidKey) {
    return (
      <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center text-center p-8 relative z-10">
        <div>
          <h2 className="text-white font-extrabold tracking-tight mb-2">MapTiler API Key Required</h2>
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

  // A component to recenter the map when the position changes by search
  const Recenter = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
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

      <MapContainer 
        center={position || defaultCenter} 
        zoom={13} 
        style={{ width: '100%', height: '100%', background: '#020617' }}
        zoomControl={!readOnly}
        dragging={!readOnly}
        scrollWheelZoom={!readOnly}
        doubleClickZoom={!readOnly}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
          url={`https://api.maptiler.com/maps/basic-v2-dark/{z}/{x}/{y}.png?key=${API_KEY}`}
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} readOnly={readOnly} />
        {position && <Recenter lat={position.lat} lng={position.lng} />}
      </MapContainer>

      {readOnly && position && (
        <button 
          onClick={openMap}
          className="absolute bottom-4 left-4 z-[400] bg-white text-slate-900 px-6 py-2 rounded-lg font-extrabold tracking-tight text-sm shadow-xl hover:bg-blue-600 hover:scale-[1.02] active:scale-95 hover:text-white transition-all duration-300 ease-in-out flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Open in Map
        </button>
      )}
    </div>
  );
};
