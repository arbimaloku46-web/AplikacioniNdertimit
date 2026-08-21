const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Remove the close button
code = code.replace(
  /<button[\s\S]*?onClick=\{onClose\}[\s\S]*?<\/button>/,
  ""
);

// Modify the wrapper container
code = code.replace(
  /className="fixed inset-0 z-50 bg-brand-dark flex flex-col"/,
  'className="fixed top-0 left-0 right-0 bottom-[72px] z-40 bg-brand-dark flex flex-col pb-safe"'
);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
