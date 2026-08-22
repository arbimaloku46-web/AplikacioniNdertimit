const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /<WeatherWidget\s+conditions=\{[^}]+\}\s*\/>/g,
  '<WeatherWidget location={activeProject.location} date={activeProject.updates[activeUpdateIndex].date} />'
);

fs.writeFileSync('App.tsx', code);
console.log('Fixed WeatherWidget usage');
