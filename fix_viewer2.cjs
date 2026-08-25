const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1
code = code.replace(
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"',
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl" style={{ lineHeight: 0 }}'
);
code = code.replace(
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0 object-contain"',
  'className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"'
);

// Level 2
code = code.replace(
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white"',
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white" style={{ lineHeight: 0 }}'
);

// Level 3
code = code.replace(
  'className="relative flex min-h-0 min-w-0 max-w-full max-h-full"',
  'className="relative inline-block min-h-0 min-w-0 max-w-full max-h-full" style={{ lineHeight: 0 }}'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
