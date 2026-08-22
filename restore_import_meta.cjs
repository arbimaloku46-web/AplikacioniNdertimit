const fs = require('fs');
for (const file of ['components/LocationPicker.tsx', 'components/DashboardMap.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/declare const __MAPTILER_API_KEY__: string;\n/, "");
  content = content.replace(/const API_KEY = typeof __MAPTILER_API_KEY__ !== 'undefined' \? __MAPTILER_API_KEY__ : '';/, "const API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';");
  fs.writeFileSync(file, content);
}
