const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// Change grid-cols-2 to dynamically be grid-cols-1 if discussion, or if overview
code = code.replace(
    /<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">/,
    `<div className={\`grid grid-cols-1 \${projectTab === 'overview' ? 'lg:grid-cols-2' : ''} gap-6 mt-12\`}>`
);

// Wrap Project Calendar with projectTab !== 'discussion'
code = code.replace(
    /({\/\* Project Calendar Tab \*\/})/,
    `{projectTab !== 'discussion' && (\n                    $1`
);

code = code.replace(
    /(<ProjectCalendar[\s\S]*?\/>\s*<\/div>\s*\)\}\s*<\/div>)/,
    `$1\n                    )}`
);

fs.writeFileSync('App.tsx', code);
