import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
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

const LocationMarker = ({ position, onSelect, readOnly }: { position: { lat: number; lng: number } | null, onSelect?: (lat: number, lng: number) => void, readOnly?: boolean }) => {
  useMapEvents({
    click(e) {
      if (!readOnly && onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialPosition, onLocationSelect, readOnly = false }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || null);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleSelect = (lat: number, lng: number) => {
    if (readOnly) return;
    setPosition({ lat, lng });
    if (onLocationSelect) onLocationSelect(lat, lng);
  };

  const defaultCenter = { lat: 41.3275, lng: 19.8187 }; // Tirana center as default

  const openGoogleMaps = () => {
    if (position) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`, '_blank');
    }
  };

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 relative z-10 group">
      <MapContainer center={initialPosition || defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <LocationMarker position={position} onSelect={handleSelect} readOnly={readOnly} />
      </MapContainer>
      {readOnly && position && (
        <button 
          onClick={openGoogleMaps}
          className="absolute bottom-4 left-4 z-[400] bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm shadow-xl hover:bg-brand-blue hover:text-white transition-colors flex items-center gap-2"
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
