const fs = require('fs');

let code = fs.readFileSync('components/SplatViewer.tsx', 'utf8');

// Add hasStarted state
code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(true\);/,
  `const [isLoading, setIsLoading] = useState(true);\n  const [hasStarted, setHasStarted] = useState(false);`
);

// Update onClick
code = code.replace(
  /onClick=\{\(\) => setIsInteracting\(true\)\}/,
  `onClick={() => { setIsInteracting(true); setHasStarted(true); }}`
);

// Update toggleFullScreen
code = code.replace(
  /setIsCssFullscreen\(true\);\n        setIsInteracting\(true\);/g,
  `setIsCssFullscreen(true);\n        setIsInteracting(true);\n        setHasStarted(true);`
);

// Conditional iframe
code = code.replace(
  /<iframe\s+src=\{url\}\s+title=\{title\}/,
  `{hasStarted && (
        <iframe 
        src={url}
        title={title}`
);

code = code.replace(
  /sandbox="allow-scripts allow-same-origin"\s+><\/iframe>/,
  `sandbox="allow-scripts allow-same-origin"
      ></iframe>
      )}`
);

// Add a placeholder when not started
const loadingBlock = `{isLoading && (
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

const newLoadingBlock = `{isLoading && hasStarted && (
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
      )}
      
      {!hasStarted && (
        <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
            <svg className="w-24 h-24 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>
        </div>
      )}`;

code = code.replace(loadingBlock, newLoadingBlock);

code = code.replace(
  /{!isLoading && !isInteracting && !isFullscreen && \(/,
  `{!isInteracting && !isFullscreen && (`
);

fs.writeFileSync('components/SplatViewer.tsx', code);
console.log('Patched SplatViewer.tsx');
