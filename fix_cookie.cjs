const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf-8');

code = code.replace(
    /if \(!displayUrl\.includes\('cookie_consent'\)\) \{\s*displayUrl \+= \(displayUrl\.includes\('\?'\) \? '&' : '\?'\) \+ 'gdpr=0&cookie_consent=true';\s*\}/g,
    ''
);

fs.writeFileSync('components/SplatViewer.tsx', code);
