const fs = require('fs');
for (const file of ['components/LocationPicker.tsx', 'components/DashboardMap.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const API_KEY =[\s\S]*?'';/, "declare const __MAPTILER_API_KEY__: string;\nconst API_KEY = typeof __MAPTILER_API_KEY__ !== 'undefined' ? __MAPTILER_API_KEY__ : '';");
  content = content.replace(/  console\.log\("API_KEY is: ", API_KEY\);\n/, "");
  fs.writeFileSync(file, content);
}
