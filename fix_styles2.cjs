const fs = require('fs');

function patchFile(filename, replaceConfig) {
  let code = fs.readFileSync(filename, 'utf8');
  let patched = false;
  for (const [oldStr, newStr] of replaceConfig) {
    if (code.includes(oldStr)) {
      code = code.split(oldStr).join(newStr);
      patched = true;
    }
  }
  if (patched) {
    fs.writeFileSync(filename, code);
    console.log(`Patched ${filename}`);
  }
}

// Ensure wrappers are inline-flex so they shrink-wrap width!
const configs = [
  [
    'className="relative flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl shadow-2xl"',
    'className="relative inline-flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl shadow-2xl"'
  ],
  [
    'className="relative flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl"',
    'className="relative inline-flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl"'
  ],
  [
    'className="relative flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl bg-white"',
    'className="relative inline-flex justify-center items-center max-w-full max-h-full min-h-0 min-w-0 rounded-2xl overflow-hidden shadow-2xl bg-white"'
  ]
];

patchFile('components/BuildingConfigurator.tsx', configs);
patchFile('components/InteractiveViewer.tsx', configs);

