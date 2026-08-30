const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

code = code.replace(
    /({projectTab !== 'discussion' && \()\s*({\/\* Progress Bar - Compact on Mobile \*\/})/g,
    `$2\n$1\n<React.Fragment>`
);
code = code.replace(
    /(<div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: \`\${.*?}%` }} \/>\s*<\/div>\s*<\/div>\s*<\/div>)\s*(}\))/g,
    `$1\n</React.Fragment>\n$2`
);

code = code.replace(
    /({projectTab !== 'discussion' && \()\s*({\/\* Week Selector - Swipable \*\/})/g,
    `$2\n$1\n<React.Fragment>`
);
code = code.replace(
    /(<\/button>\s*\)\s*}\)\s*}\s*<\/div>)\s*(}\))/g,
    `$1\n</React.Fragment>\n$2`
);

fs.writeFileSync('App.tsx', code);
