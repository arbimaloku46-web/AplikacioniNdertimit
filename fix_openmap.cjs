const fs = require('fs');

let content = fs.readFileSync('components/LocationPicker.tsx', 'utf8');
content = content.replace(/window\.open\(\`https:\/\/www\.openstreetmap\.org\/\?mlat=\$\{position\.lat\}&mlon=\$\{position\.lng\}#map=15\/\$\{position\.lat\}\/\$\{position\.lng\}\`, '_blank'\);/, "window.open(`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`, '_blank');");
fs.writeFileSync('components/LocationPicker.tsx', content);
