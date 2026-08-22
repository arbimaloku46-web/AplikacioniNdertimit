const fs = require('fs');

let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
viteConfig = viteConfig.replace(/'import\.meta\.env\.VITE_MAPTILER_API_KEY': JSON\.stringify\(env\.MAPTILER_API_KEY \|\| ''\)/, "'__MAPTILER_API_KEY__': JSON.stringify(env.MAPTILER_API_KEY || '')");
fs.writeFileSync('vite.config.ts', viteConfig);

for (const file of ['components/LocationPicker.tsx', 'components/DashboardMap.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const API_KEY = import\.meta\.env\.VITE_MAPTILER_API_KEY \|\| '';/, "const API_KEY = typeof __MAPTILER_API_KEY__ !== 'undefined' ? __MAPTILER_API_KEY__ : '';");
  // Ensure the declare is there
  if (!content.includes('declare const __MAPTILER_API_KEY__')) {
    content = content.replace(/const API_KEY = /, "declare const __MAPTILER_API_KEY__: string;\nconst API_KEY = ");
  }
  fs.writeFileSync(file, content);
}
