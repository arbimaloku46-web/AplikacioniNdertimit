const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf-8');

if (!code.includes("import { LoadingSpinner }")) {
  code = code.replace(
    "import { Button } from './Button';",
    "import { Button } from './Button';\nimport { LoadingSpinner } from './LoadingSpinner';"
  );
}

const oldLoader = `{isLoading && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/80 backdrop-blur-md pointer-events-none">
          <div className="flex flex-col items-center">
             <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-brand-blue/20 border-t-brand-blue animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-[8px] font-extrabold tracking-tight text-brand-blue">{type.toUpperCase()}</span>
                </div>
             </div>
             <p className="mt-4 text-[10px] text-slate-500 font-extrabold tracking-tight uppercase tracking-widest">Loading...</p>
          </div>
        </div>
      )}`;

const newLoader = `{isLoading && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/80 backdrop-blur-md pointer-events-none">
          <LoadingSpinner message="Loading Interactive Model..." />
        </div>
      )}`;

code = code.replace(oldLoader, newLoader);

fs.writeFileSync('components/SplatViewer.tsx', code);
