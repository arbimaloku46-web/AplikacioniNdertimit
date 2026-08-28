const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// The crash is at line 772:
// <div className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">{activeProject.updates[activeUpdateIndex].stats.completion}%</div>
// and 774:
// style={{ width: \`\${activeProject.updates[activeUpdateIndex].stats.completion}%\` }}

code = code.replace(
    /\{activeProject\.updates\[activeUpdateIndex\]\.stats\.completion\}%/g,
    "{activeProject.updates[activeUpdateIndex]?.stats?.completion || 0}%"
);

code = code.replace(
    /style=\{\{ width: \`\\\$\\{activeProject\.updates\[activeUpdateIndex\]\.stats\.completion\\}%\` \}\}/g,
    "style={{ width: `${activeProject.updates[activeUpdateIndex]?.stats?.completion || 0}%` }}"
);

fs.writeFileSync('App.tsx', code);
console.log('Patched crash');
