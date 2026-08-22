const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// 1. Remove state
code = code.replace(
  "const [showInteractiveBuilding, setShowInteractiveBuilding] = useState(false);\n",
  ""
);

// 2. Change onClick
code = code.replace(
  "onClick={() => setShowInteractiveBuilding(true)}",
  "onClick={() => setCurrentView(AppView.INTERACTIVE_VIEWER)}"
);

// 3. Update view condition
code = code.replace(
  "{showInteractiveBuilding && activeProject && (",
  "{currentView === AppView.INTERACTIVE_VIEWER && activeProject && ("
);

// 4. Update onClose
code = code.replace(
  "onClose={() => setShowInteractiveBuilding(false)}",
  "onClose={() => setCurrentView(AppView.PROJECT_DETAIL)}"
);

// 5. Hide MobileBottomNav
code = code.replace(
  "{currentView !== AppView.PROJECT_DETAIL && currentView !== AppView.MAPPER && (",
  "{currentView !== AppView.PROJECT_DETAIL && currentView !== AppView.MAPPER && currentView !== AppView.INTERACTIVE_VIEWER && ("
);

fs.writeFileSync('App.tsx', code);
console.log("Patched App.tsx");
