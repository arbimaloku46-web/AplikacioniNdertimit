const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1
code = code.replace(
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"',
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"'
); // unchanged
code = code.replace(
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"',
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0 object-contain"'
);

// Level 2
code = code.replace(
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"',
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"'
); // unchanged

// Note: I already replaced 'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"' globally?
// Let's just do a global replace for all image classes that we modified before.

fs.writeFileSync('components/InteractiveViewer.tsx', code);
