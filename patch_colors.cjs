const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');
code = code.replace(
  'stroke={\n                          hoveredPath === unit.id \n                            ? (unit.status === \'available\' ? "#10b981" : unit.status === \'reserved\' ? "#f59e0b" : "#ef4444")\n                            : "transparent"\n                        }',
  'stroke={\n                          unit.status === \'available\' ? "#10b981" : unit.status === \'reserved\' ? "#f59e0b" : "#ef4444"\n                        }'
);
// Also increase fill opacity slightly for better visibility
code = code.replace(
  ': (unit.status === \'available\' ? "rgba(16, 185, 129, 0.15)" : unit.status === \'reserved\' ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)")',
  ': (unit.status === \'available\' ? "rgba(16, 185, 129, 0.25)" : unit.status === \'reserved\' ? "rgba(245, 158, 11, 0.25)" : "rgba(239, 68, 68, 0.25)")'
);
fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx colors");
