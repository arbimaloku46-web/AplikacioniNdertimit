const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./').filter(f => f.endsWith('.tsx') && !f.includes('node_modules'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Text colors
  content = content.replace(/\btext-slate-200\b/g, 'text-slate-300');
  content = content.replace(/\btext-slate-300\b/g, 'text-slate-400');
  content = content.replace(/\btext-slate-400\b/g, 'text-slate-500');

  // Headings
  content = content.replace(/\bfont-bold\b/g, 'font-extrabold tracking-tight');
  
  // Spacing (Be careful with padding/margin replacement order)
  // First do the larger ones so we don't double replace
  content = content.replace(/\bp-6\b/g, 'p-8');
  content = content.replace(/\bp-4\b/g, 'p-6');
  
  content = content.replace(/\bpx-6\b/g, 'px-8');
  content = content.replace(/\bpx-4\b/g, 'px-6');
  
  content = content.replace(/\bpy-6\b/g, 'py-8');
  content = content.replace(/\bpy-4\b/g, 'py-6');

  content = content.replace(/\bgap-6\b/g, 'gap-8');
  content = content.replace(/\bgap-4\b/g, 'gap-6');

  // Depth & Surface
  content = content.replace(/\bborder border-slate-700\b/g, 'border border-white/5 shadow-2xl shadow-black/40');
  content = content.replace(/\bborder border-white\/10\b/g, 'border border-white/5 shadow-2xl shadow-black/40');
  content = content.replace(/\bborder-slate-800\b/g, 'border-white/5');

  // Backgrounds with backdrop blur
  content = content.replace(/\bbg-slate-800\b/g, 'bg-slate-800/80 backdrop-blur-xl');
  // Need to avoid replacing slate-900 if it already has /90 or similar, but let's assume it doesn't mostly.
  content = content.replace(/\bbg-slate-900(?![\/\-])\b/g, 'bg-slate-900/90 backdrop-blur-2xl');

  // Rounding
  content = content.replace(/\brounded-xl\b/g, 'rounded-2xl');
  // Avoid changing rounded-lg inside rounded-lg classes that are already there, but we can try
  // Actually, rounded-2xl looks much more modern. Let's just do rounded-2xl
  
  // Interactive Polish
  content = content.replace(/\btransition-colors\b/g, 'transition-all duration-300 ease-in-out');
  
  // Try to add hover scales to buttons.
  // We can look for <button ... className="..."> and inject hover states.
  // Or just find hover:bg-slate-700 and add classes
  content = content.replace(/\bhover:bg-slate-700\b/g, 'hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95');
  content = content.replace(/\bhover:bg-brand-blue\b/g, 'hover:bg-blue-600 hover:scale-[1.02] active:scale-95');
  
  // Ensure we don't have duplicated transition-all
  content = content.replace(/transition-all duration-300 ease-in-out transition-all duration-300 ease-in-out/g, 'transition-all duration-300 ease-in-out');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Done refactoring styles');
