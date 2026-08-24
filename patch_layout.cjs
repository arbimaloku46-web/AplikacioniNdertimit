const fs = require('fs');

function patchFile(filename, oldStr, newStr) {
  let code = fs.readFileSync(filename, 'utf8');
  if (code.includes(oldStr)) {
    code = code.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
    fs.writeFileSync(filename, code);
    console.log("Patched", filename);
  } else {
    console.log("Not found in", filename);
  }
}

// BuildingConfigurator
patchFile(
  'components/BuildingConfigurator.tsx',
  '<div className="relative flex max-w-full max-h-full rounded-2xl shadow-2xl">',
  '<div className="relative inline-block max-w-full max-h-full rounded-2xl shadow-2xl">'
);

// InteractiveViewer Exterior
patchFile(
  'components/InteractiveViewer.tsx',
  '<div className="relative flex max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">',
  '<div className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">'
);

// InteractiveViewer Floor
patchFile(
  'components/InteractiveViewer.tsx',
  '<div className="relative flex max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white">',
  '<div className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white">'
);
