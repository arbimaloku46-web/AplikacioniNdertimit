const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// 1. Add projectTab state
code = code.replace(
  /const \[activeProject, setActiveProject\] = useState<Project \| null>\(null\);/,
  "const [activeProject, setActiveProject] = useState<Project | null>(null);\n  const [projectTab, setProjectTab] = useState<'wall' | 'explore' | 'discussion' | 'calendar'>('wall');"
);

// 2. Remove showInteractiveBuilding
code = code.replace(
  /const \[showInteractiveBuilding, setShowInteractiveBuilding\] = useState\(false\);/,
  ""
);

// 3. Reset projectTab when selecting a project
code = code.replace(
  /const handleProjectSelect = \(p: Project\) => \{/,
  "const handleProjectSelect = (p: Project) => {\n    setProjectTab('wall');"
);

fs.writeFileSync('App.tsx', code);
