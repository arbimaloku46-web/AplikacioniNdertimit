const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Replace outer div class
code = code.replace(
  `className="w-full h-[85vh] bg-slate-950 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col relative font-sans"`,
  `className="w-full h-[100dvh] bg-slate-950 overflow-hidden flex flex-col relative font-sans"`
);

// Replace Navigation Header
const oldHeader = `<div className="h-16 px-6 border-b border-white/5 flex items-center bg-slate-900/50 backdrop-blur-md shrink-0 relative z-10">
          <AnimatePresence mode="popLayout">
            {level !== 'building' ? (
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
            ) : null}
          </AnimatePresence>
          <div className="ml-auto text-sm font-extrabold tracking-tight text-white flex items-center gap-2 uppercase tracking-wider">
            <span className={level === 'building' ? 'text-brand-blue' : 'text-slate-500'}>Building</span>
            <ChevronLeft className="w-4 h-4 rotate-180 text-slate-700" />
            <span className={level === 'floor' ? 'text-brand-blue' : 'text-slate-500'}>Floor</span>
            <ChevronLeft className="w-4 h-4 rotate-180 text-slate-700" />
            <span className={level === 'unit' ? 'text-brand-blue' : 'text-slate-500'}>Unit</span>
          </div>
        </div>`;

const newHeader = `<div className="h-16 px-4 sm:px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md shrink-0 relative z-10">
          <AnimatePresence mode="popLayout">
            {level !== 'building' ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={goBack}
                className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-extrabold tracking-tight uppercase tracking-wider">
                  <span className="hidden sm:inline">{level === 'unit' ? 'Back to Floor' : 'Back to Building'}</span>
                  <span className="sm:hidden">Back</span>
                </span>
              </motion.button>
            ) : onClose ? (
              <motion.button
                key="close"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={onClose}
                className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-extrabold tracking-tight uppercase tracking-wider">
                  <span className="hidden sm:inline">Back to Project</span>
                  <span className="sm:hidden">Back</span>
                </span>
              </motion.button>
            ) : null}
          </AnimatePresence>
          <div className="text-[10px] sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-1 sm:gap-2 uppercase tracking-wider ml-auto overflow-hidden">
            <span className={level === 'building' ? 'text-brand-blue truncate' : 'text-slate-500 truncate hidden sm:inline'}>Building</span>
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 rotate-180 text-slate-700 hidden sm:block shrink-0" />
            <span className={level === 'floor' ? 'text-brand-blue truncate' : 'text-slate-500 truncate hidden sm:inline'}>Floor</span>
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 rotate-180 text-slate-700 hidden sm:block shrink-0" />
            <span className={level === 'unit' ? 'text-brand-blue truncate' : 'text-slate-500 truncate'}>Unit</span>
          </div>
        </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Patched InteractiveViewer.tsx');
