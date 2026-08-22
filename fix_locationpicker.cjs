const fs = require('fs');

let content = fs.readFileSync('components/LocationPicker.tsx', 'utf8');

// Change interactive to true
content = content.replace("interactive: !readOnly,", "interactive: true,\n        navigationControl: false,\n        geolocateControl: false,\n        maptilerLogo: false,");

// Add style block to hide logos
content = content.replace("<div ref={mapContainer} className=\"w-full h-full bg-[#020617]\" />", `<div ref={mapContainer} className="w-full h-full bg-[#020617]" />
      
      <style dangerouslySetInnerHTML={{__html: \`
        .maplibregl-control-container,
        .maplibregl-ctrl-bottom-left,
        .maplibregl-ctrl-bottom-right,
        .maplibregl-ctrl-attrib,
        .maptiler-logo {
          display: none !important;
        }
      \`}} />`);

fs.writeFileSync('components/LocationPicker.tsx', content);
