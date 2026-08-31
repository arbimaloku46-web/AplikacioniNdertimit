const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

code = code.replace(
    /className=\{\`flex gap-3 overflow-x-auto no-scrollbar snap-x \$\{projectTab === 'models' \? 'pb-2 mb-4' : 'pb-6 mb-8'\}\`\}/g,
    'className={`flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2 mb-4 md:pb-4 md:mb-6`}'
);

code = code.replace(
    /className=\{\`grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 relative z-10 \$\{projectTab === 'models' \? 'mb-4' : 'mb-16'\}\`\}/g,
    'className={`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 relative z-10 mb-4 md:mb-16`}'
);

fs.writeFileSync('App.tsx', code);
