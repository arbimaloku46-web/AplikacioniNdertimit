const fs = require('fs');
let content = fs.readFileSync('components/LocationPicker.tsx', 'utf8');

content = content.replace("const Recenter = ({ lat, lng }: { lat: number, lng: number }) => {", `const Recenter = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
  }

  const MapInvalidator = () => {
    const map = useMapEvents({});
    useEffect(() => {
      const timer1 = setTimeout(() => map.invalidateSize(), 100);
      const timer2 = setTimeout(() => map.invalidateSize(), 500);
      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        window.removeEventListener('resize', handleResize);
      };
    }, [map]);
    return null;
  };
  
  const OldRecenter = ({ lat, lng }: { lat: number, lng: number }) => {`);

content = content.replace("<MapContainer ", "<MapContainer ");
content = content.replace("<TileLayer", "<MapInvalidator />\n        <TileLayer");
content = content.replace("&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap contributors</a>", "");
content = content.replace("const OldRecenter = ({ lat, lng }: { lat: number, lng: number }) => {\n    const map = useMapEvents({});\n    useEffect(() => {\n        map.setView([lat, lng]);\n    }, [lat, lng, map]);\n    return null;\n  }", "");
fs.writeFileSync('components/LocationPicker.tsx', content);
