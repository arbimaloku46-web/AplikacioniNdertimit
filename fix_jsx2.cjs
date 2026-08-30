const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

code = code.replace(
    /({?\/\* Progress Bar - Compact on Mobile \*\/}?)[\s\S]*?({projectTab !== 'discussion' && \(\s*<React.Fragment>)/g,
    `{/* Progress Bar - Compact on Mobile */}\n{projectTab !== 'discussion' && (\n<React.Fragment>`
);

code = code.replace(
    /(<div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: \`\${.*?}%` }} \/>\s*<\/div>\s*<\/div>\s*<\/div>)\s*\)\}/g,
    `$1\n</React.Fragment>\n)}`
);

code = code.replace(
    /({?\/\* Week Selector - Swipable \*\/}?)[\s\S]*?({projectTab !== 'discussion' && \(\s*<React.Fragment>)/g,
    `{/* Week Selector - Swipable */}\n{projectTab !== 'discussion' && (\n<React.Fragment>`
);

code = code.replace(
    /(<\/button>\s*\)\s*}\)\s*}\s*<\/div>)\s*\)\}/g,
    `$1\n</React.Fragment>\n)}`
);

fs.writeFileSync('App.tsx', code);
