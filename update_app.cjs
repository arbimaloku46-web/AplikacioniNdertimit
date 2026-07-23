const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace("import { DashboardMap } from './components/DashboardMap';\\n", "");

const targetBlock = `                {/* Project Map View */}
                {!loadingProjects && activeProjectsList.length > 0 && (
                    <DashboardMap 
                        projects={activeProjectsList} 
                        onProjectClick={handleProjectSelect} 
                    />
                )}`;

content = content.replace(targetBlock, "");

fs.writeFileSync('App.tsx', content);
