const fs = require('fs');
let code = fs.readFileSync('components/ProjectCalendar.tsx', 'utf8');

// Update day cell classes
code = code.replace(
  "className={`aspect-square relative rounded-2xl border flex flex-col items-center justify-center p-1 md:p-2 transition-all ${",
  "className={`aspect-square relative rounded-2xl border flex flex-col items-center justify-start pt-2 md:pt-3 p-1 md:p-2 transition-all ${"
);

// Update day number font
code = code.replace(
  "className={`text-sm md:text-base font-medium ${isActive ? 'text-white' : hasUpdate ? 'text-slate-200' : 'text-slate-600'}`}",
  "className={`text-base md:text-lg font-extrabold tracking-tight ${isActive ? 'text-white' : hasUpdate ? 'text-white' : 'text-slate-600'}`}"
);

// Update title and icon
code = code.replace(
  'className={`text-[8px] md:text-[9px] text-center px-1 leading-tight mt-1 line-clamp-2 ${isActive ? \'text-white/80\' : \'text-slate-400 group-hover:text-slate-300\'}`}',
  'className={`text-[9px] md:text-[10px] text-center px-1 leading-tight mt-auto mb-1 line-clamp-1 font-medium ${isActive ? \'text-white/90\' : \'text-brand-blue group-hover:text-blue-400\'}`}'
);

code = code.replace(
  'className="absolute top-2 right-2 flex items-center justify-center"',
  'className="absolute top-2 right-2 flex items-center justify-center"'
);

code = code.replace(
  'CheckCircle2 className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? \'text-white\' : \'text-brand-blue\'}`}',
  'CheckCircle2 className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? \'text-white\' : \'text-brand-blue\'}`}'
);

fs.writeFileSync('components/ProjectCalendar.tsx', code);
console.log("Patched ProjectCalendar.tsx");
