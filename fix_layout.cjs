const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// 1. Hide Total Progress in discussion
code = code.replace(
    /{?\/\* Progress Bar - Compact on Mobile \*\/}?/,
    `{projectTab !== 'discussion' && (\n                    {/* Progress Bar - Compact on Mobile */}`
);
code = code.replace(
    /(<div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: \`\${.*?}%` }} \/>\s*<\/div>\s*<\/div>\s*<\/div>)/,
    `$1\n                    )}`
);

// 2. Hide Week selector in discussion
code = code.replace(
    /{?\/\* Week Selector - Swipable \*\/}?/,
    `{projectTab !== 'discussion' && (\n                {/* Week Selector - Swipable */}`
);
code = code.replace(
    /(<\/button>\s*\)\s*}\)\s*}\s*<\/div>)/,
    `$1\n                )}`
);

fs.writeFileSync('App.tsx', code);
