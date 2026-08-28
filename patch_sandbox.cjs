const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf8');

if (!code.includes('sandbox=')) {
  code = code.replace(/allow="accelerometer/g, 'sandbox="allow-scripts allow-same-origin allow-presentation"\n        allow="accelerometer');
  fs.writeFileSync('components/SplatViewer.tsx', code);
  console.log('Patched SplatViewer sandbox');
}

let code2 = fs.readFileSync('components/MediaGrid.tsx', 'utf8');
if (!code2.includes('sandbox=')) {
  code2 = code2.replace(/allow="accelerometer/g, 'sandbox="allow-scripts allow-same-origin allow-presentation"\n                                    allow="accelerometer');
  fs.writeFileSync('components/MediaGrid.tsx', code2);
  console.log('Patched MediaGrid sandbox');
}
