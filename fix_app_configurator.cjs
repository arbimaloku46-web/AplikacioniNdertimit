const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  'initialData={activeProject.interactiveBuilding || DEMO_INTERACTIVE_BUILDING}',
  'project={activeProject}'
);

fs.writeFileSync('App.tsx', code);
console.log('Fixed BuildingConfigurator usage');
