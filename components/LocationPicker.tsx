import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

interface LocationPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const API_KEY = '2XSQoYHYmYcpza7rCRwj';
maptilersdk.config.apiKey = API_KEY;

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialPosition, onLocationSelect, readOnly = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);
  
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialPosition || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      if (map.current) {
         map.current.setCenter([initialPosition.lng, initialPosition.lat]);
         if (!marker.current) {
            marker.current = new maptilersdk.Marker().setLngLat([initialPosition.lng, initialPosition.lat]).addTo(map.current);
         } else {
            marker.current.setLngLat([initialPosition.lng, initialPosition.lat]);
         }
      }
    }
  }, [initialPosition]);

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const defaultCenter = position || { lat: 41.3275, lng: 19.8187 };
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.DATAVIZ.DARK,
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: 13,
        interactive: true,
        navigationControl: false,
        geolocateControl: false,
        maptilerLogo: false,
      });

      if (position) {
        marker.current = new maptilersdk.Marker().setLngLat([position.lng, position.lat]).addTo(map.current);
      }

      if (!readOnly) {
        map.current.on('click', (e) => {
          const lat = e.lngLat.lat;
          const lng = e.lngLat.lng;
          setPosition({ lat, lng });
          if (onLocationSelect) onLocationSelect(lat, lng);
          
          if (!marker.current) {
            marker.current = new maptilersdk.Marker().setLngLat([lng, lat]).addTo(map.current!);
          } else {
            marker.current.setLngLat([lng, lat]);
          }
        });
      }
      
      const timer = setTimeout(() => {
          if (map.current) map.current.resize();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

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
      if (!res.ok) throw new Error('Failed to find location');
      const data = await res.json();
      if (data.lat && data.lng) {
        setPosition(data);
        if (onLocationSelect) onLocationSelect(data.lat, data.lng);
        if (map.current) {
          map.current.flyTo({ center: [data.lng, data.lat], zoom: 14 });
          if (!marker.current) {
            marker.current = new maptilersdk.Marker().setLngLat([data.lng, data.lat]).addTo(map.current);
          } else {
            marker.current.setLngLat([data.lng, data.lat]);
          }
        }
      }
    } catch (err: any) {
      alert("Failed to find location");
    } finally {
      setIsSearching(false);
    }
  };

  const openMap = () => {
    if (position) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`, '_blank');
    }
  };

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
      
      <div ref={mapContainer} className="w-full h-full bg-[#020617]" />
      
      <style dangerouslySetInnerHTML={{__html: `
        .maplibregl-control-container,
        .maplibregl-ctrl-bottom-left,
        .maplibregl-ctrl-bottom-right,
        .maplibregl-ctrl-attrib,
        .maptiler-logo {
          display: none !important;
        }
      `}} />

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
