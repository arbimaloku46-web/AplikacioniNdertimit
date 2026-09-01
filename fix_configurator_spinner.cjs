const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf-8');

if (!code.includes("import { LoadingSpinner }")) {
  code = code.replace(
    "import { InteractiveBuilding, Floor, Unit } from '../types';",
    "import { InteractiveBuilding, Floor, Unit } from '../types';\nimport { LoadingSpinner } from './LoadingSpinner';"
  );
  
  // Render loading spinner when uploading
  code = code.replace(
    '<div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl z-[100] flex">',
    `<div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl z-[100] flex">
      {isUploading && (
        <div className="absolute inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center">
          <LoadingSpinner message="Uploading Image..." />
        </div>
      )}`
  );

  fs.writeFileSync('components/BuildingConfigurator.tsx', code);
}
