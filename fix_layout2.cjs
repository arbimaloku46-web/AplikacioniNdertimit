const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// In Hero Experience Suite, wrap lg:col-span-4 with {projectTab === 'overview' && ( ... )}
code = code.replace(
    /(<div className="lg:col-span-4 space-y-8 relative z-20">)/,
    `{projectTab === 'overview' && (\n                    $1`
);

code = code.replace(
    /(<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">)/,
    `                   )}\n                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">`
);

// We need to expand lg:col-span-8 to col-span-12 when projectTab === 'models'
code = code.replace(
    /<div className="lg:col-span-8 space-y-6 md:space-y-8">/,
    `<div className={\`space-y-6 md:space-y-8 \${projectTab === 'overview' ? 'lg:col-span-8' : 'lg:col-span-12'}\`}>`
);

fs.writeFileSync('App.tsx', code);
