const fs = require('fs');

// ----------------------------------------------------
// 1. Fix InteractiveViewer layouts
// ----------------------------------------------------
let iv = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Replace level 1 wrapper
iv = iv.replace(
  'className="relative inline-flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl"',
  'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl" style={{ lineHeight: 0 }}'
);
// In case it wasn't replaced properly before:
iv = iv.replace(
  'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"',
  'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl" style={{ lineHeight: 0 }}'
);
// img
iv = iv.replace(
  'className="block max-w-full max-h-full w-auto h-auto" style={{ minHeight: 0, minWidth: 0 }}',
  'className="block max-w-full max-h-full w-auto h-auto"'
);

// Replace level 2 wrapper
iv = iv.replace(
  'className="relative inline-flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl bg-white"',
  'className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white" style={{ lineHeight: 0 }}'
);
// img
iv = iv.replace(
  'className="block max-w-full max-h-full w-auto h-auto" style={{ minHeight: 0, minWidth: 0 }}',
  'className="block max-w-full max-h-full w-auto h-auto"'
);

// Replace level 3 wrapper
iv = iv.replace(
  'className="block max-w-full max-h-full w-auto h-auto" style={{ minHeight: 0, minWidth: 0 }}',
  'className="block max-w-full max-h-full w-auto h-auto"'
);

// Ensure the image wrapper in level 3 is inline-block (it was just the img inside a div)
iv = iv.replace(
  'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0 min-w-0 overflow-hidden"',
  'className="w-full md:w-2/3 h-auto md:h-full p-6 md:p-12 flex items-center justify-center bg-white shrink-0 min-h-[40vh] md:min-h-0 min-w-0 overflow-hidden"'
);
// Wait, level 3 img was just inside the flex container directly?
// Let's wrap it in inline-block if it wasn't
if(iv.includes('<img \n                  src={activeUnit.floorPlanUrl}')) {
  iv = iv.replace(
    /<img \s*src={activeUnit\.floorPlanUrl}[\s\S]*?\/>/,
    `<div className="relative inline-block max-w-full max-h-full" style={{ lineHeight: 0 }}>
                  $&
                </div>`
  );
}

fs.writeFileSync('components/InteractiveViewer.tsx', iv);
console.log('Fixed InteractiveViewer layouts');
