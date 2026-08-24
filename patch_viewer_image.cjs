const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Exterior
code = code.replace(
  '<div className="relative inline-block max-w-full max-h-full">\n                <img \n                  src={data.mainImageUrl} \n                  alt={data.name} \n                  className="w-full h-[85vh] object-contain drop-shadow-2xl"\n                />',
  '<div className="relative inline-block max-w-full max-h-full">\n                <img \n                  src={data.mainImageUrl} \n                  alt={data.name} \n                  className="block w-auto h-auto max-w-full max-h-[85vh] drop-shadow-2xl"\n                />'
);

// Floor
code = code.replace(
  '<div className="relative inline-block max-w-full max-h-full">\n                  <img \n                    src={activeFloor.floorPlanUrl} \n                    alt={activeFloor.name} \n                    className="w-full h-[85vh] object-contain shadow-2xl bg-white"\n                  />',
  '<div className="relative inline-block max-w-full max-h-full">\n                  <img \n                    src={activeFloor.floorPlanUrl} \n                    alt={activeFloor.name} \n                    className="block w-auto h-auto max-w-full max-h-[85vh] shadow-2xl bg-white"\n                  />'
);

// Unit
// Unit view level doesn't have an SVG overlay, but it's good to keep consistent
code = code.replace(
  '<img \n                  src={activeUnit.floorPlanUrl} \n                  alt={activeUnit.name} \n                  className="w-full h-[85vh] object-contain drop-shadow-2xl"\n                />',
  '<img \n                  src={activeUnit.floorPlanUrl} \n                  alt={activeUnit.name} \n                  className="block w-auto h-auto max-w-full max-h-[85vh] drop-shadow-2xl"\n                />'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log("Patched InteractiveViewer.tsx image classes");
