const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf8');

const oldControlsHint = `{/* Controls Hint */}
      {isInteracting && !isFullscreen && (
         <div className="absolute top-4 left-4 z-30 animate-in fade-in slide-in-from-top-2 pointer-events-none">
            <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] font-extrabold tracking-tight text-white/80 uppercase tracking-wider">Interactive Mode</span>
            </div>
         </div>
      )}`;

const newControlsHint = `{/* Controls Hint and Mobile Lock */}
      {isInteracting && !isFullscreen && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto">
             <button 
                onClick={() => setIsInteracting(false)}
                className="bg-brand-blue/90 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full text-xs font-extrabold tracking-tight uppercase tracking-wider hover:bg-brand-blue shadow-xl transition-all"
             >
                Done Exploring
             </button>
         </div>
      )}`;

if (code.includes(oldControlsHint)) {
  code = code.replace(oldControlsHint, newControlsHint);
  fs.writeFileSync('components/SplatViewer.tsx', code);
  console.log('Patched SplatViewer inline button');
} else {
  console.log('Could not find Controls Hint');
}
