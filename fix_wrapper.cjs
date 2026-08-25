const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

code = code.replace(
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl"',
  'className="relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl"'
);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Fixed wrapper in BuildingConfigurator');

let code2 = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

code2 = code2.replace(
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"',
  'className="relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"'
);
code2 = code2.replace(
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"',
  'className="relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"'
);
code2 = code2.replace(
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full"',
  'className="relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code2);
console.log('Fixed wrapper in InteractiveViewer');
