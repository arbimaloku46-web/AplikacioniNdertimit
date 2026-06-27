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
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ position, onSelect }: { position: { lat: number; lng: number } | null, onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialPosition, onLocationSelect }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || null);

  const handleSelect = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    onLocationSelect(lat, lng);
  };

  const defaultCenter = { lat: 41.3275, lng: 19.8187 }; // Tirana center as default

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 relative z-10">
      <MapContainer center={initialPosition || defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onSelect={handleSelect} />
      </MapContainer>
    </div>
  );
};
