const fs = require('fs');
let code = fs.readFileSync('components/LocationPicker.tsx', 'utf8');

code = code.replace(
  '<div className="w-full h-64 rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40 relative z-10 group">',
  '<div className={`w-full relative z-10 group ${readOnly ? "h-[300px] rounded-none border-none shadow-none" : "h-64 rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40"}`}>'
);

fs.writeFileSync('components/LocationPicker.tsx', code);
console.log("Patched LocationPicker");
