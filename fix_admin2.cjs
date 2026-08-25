const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

code = code.replace(
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl"',
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl" style={{ lineHeight: 0 }}'
);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
