const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

code = code.replace(
  /<\/ImageWithOverlay>\s*<div className="w-full md:w-1\/4 h-auto md:h-full bg-slate-950/g,
  `</ImageWithOverlay>\n              </div>\n              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950`
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Done!');
