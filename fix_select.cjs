const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    let firstIndex = 0;
    if (!isAdmin) {
      firstIndex = project.updates.findIndex((u) => u.status !== "draft");
      if (firstIndex === -1) firstIndex = 0;
    }
    setActiveUpdateIndex(firstIndex);
    setCurrentView(AppView.PROJECT_DETAIL);
  };`;

const replacement = `  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    let firstIndex = 0;
    const updates = project.updates || [];
    if (!isAdmin) {
      firstIndex = updates.findIndex((u) => u.status !== "draft");
      if (firstIndex === -1) firstIndex = 0;
    }
    setActiveUpdateIndex(firstIndex);
    setProjectTab('wall');
    setCurrentView(AppView.PROJECT_DETAIL);
  };`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('App.tsx', code);
  console.log('Fixed handleProjectSelect');
} else {
  console.log('Target not found in App.tsx');
}
