const fs = require('fs');
let content = fs.readFileSync('components/MediaGrid.tsx', 'utf8');
content = content.replace(/slides=\{filteredMedia\.map\(item => \{[\s\S]*?\}\)\}/, match => match + ' as any');
fs.writeFileSync('components/MediaGrid.tsx', content);
