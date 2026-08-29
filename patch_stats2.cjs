const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
    /\.stats\.workersOnSite/g,
    ".stats?.workersOnSite"
);

code = code.replace(
    /\.stats\.workerBreakdown/g,
    ".stats?.workerBreakdown"
);

code = code.replace(
    /\.stats\.completion/g,
    ".stats?.completion"
);

fs.writeFileSync('App.tsx', code);
console.log('Patched stats nullability');
