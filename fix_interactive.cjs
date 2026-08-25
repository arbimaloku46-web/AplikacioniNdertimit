const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1:
// Find `</ImageWithOverlay>\n              </div>\n            </motion.div>\n          )}`
// And replace with `</ImageWithOverlay>\n            </motion.div>\n          )}`
code = code.replace(
  /<\/ImageWithOverlay>\s*<\/div>\s*<\/motion\.div>\s*\}\)/g,
  `</ImageWithOverlay>\n            </motion.div>\n          )}`
);

// Level 2:
// Find `</ImageWithOverlay>\n              </div>\n              \n              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950`
// And replace with `</ImageWithOverlay>\n              \n              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950`
code = code.replace(
  /<\/ImageWithOverlay>\s*<\/div>\s*<div className="w-full md:w-1\/4 h-auto md:h-full bg-slate-950/g,
  `</ImageWithOverlay>\n              <div className="w-full md:w-1/4 h-auto md:h-full bg-slate-950`
);

// Add the missing `</div>` at the end
code = code.replace(
  /<\/AnimatePresence>\s*\);\s*\};\s*$/g,
  `          </AnimatePresence>\n        </div>\n    );\n}\n`
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Fixed InteractiveViewer syntax');
