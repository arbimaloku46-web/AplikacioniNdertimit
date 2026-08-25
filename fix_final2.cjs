const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1 fix:
code = code.replace(
  /<\/ImageWithOverlay>\s*<\/div>\s*<\/motion.div>/g,
  `</ImageWithOverlay>\n              </motion.div>`
);

// Final div missing fix:
code = code.replace(
  /<\/div>\s*\);\s*\}/g,
  `        </div>\n    </div>\n  );\n}`
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
