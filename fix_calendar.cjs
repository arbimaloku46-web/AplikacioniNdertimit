const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// Change {projectTab !== 'discussion' && (  for the Project Calendar to {projectTab === 'overview' && (
code = code.replace(
    /{projectTab !== 'discussion' && \(\s*{\/\* Project Calendar Tab \*\//,
    `{projectTab === 'overview' && (\n                    {/* Project Calendar Tab */}`
);

fs.writeFileSync('App.tsx', code);
