const fs = require('fs');
const lines = fs.readFileSync('App.tsx', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes("currentView === AppView.PROJECT_DETAIL && activeProject &&"));
const end = lines.findIndex(l => l.includes("currentView === AppView.MAPPER && user?.isAdmin"));

console.log(lines.slice(start, end).join('\n').substring(0, 500));
console.log("...");
console.log(lines.slice(start, end).join('\n').substring(lines.slice(start, end).join('\n').length - 500));
