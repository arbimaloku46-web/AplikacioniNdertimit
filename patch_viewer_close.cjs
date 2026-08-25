const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Update interface
code = code.replace(
  /interface InteractiveViewerProps \{\s*data: BuildingData;\s*\}/g,
  `interface InteractiveViewerProps {\n  data: BuildingData;\n  onClose?: () => void;\n}`
);

// Update component signature
code = code.replace(
  /export function InteractiveViewer\(\{ data \}: InteractiveViewerProps\) \{/g,
  `export function InteractiveViewer({ data, onClose }: InteractiveViewerProps) {`
);

// Update Navigation Header
const oldHeader = `{level !== 'building' && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={goBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-extrabold tracking-tight uppercase tracking-wider">
                  {level === 'unit' ? 'Back to Floor' : 'Back to Building'}
                </span>
              </motion.button>
            )}`;

const newHeader = `{level !== 'building' ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={goBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-extrabold tracking-tight uppercase tracking-wider">
                  {level === 'unit' ? 'Back to Floor' : 'Back to Building'}
                </span>
              </motion.button>
            ) : onClose ? (
              <motion.button
                key="close"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={onClose}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-extrabold tracking-tight uppercase tracking-wider">
                  Back to Project
                </span>
              </motion.button>
            ) : null}`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Patched InteractiveViewer.tsx');
