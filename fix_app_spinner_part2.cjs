const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const oldLoadingProjects = `                {loadingProjects ? (
                    <div className="flex items-center justify-center py-20"> 
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                    </div>
                ) : (`;
const newLoadingProjects = `                {loadingProjects ? (
                    <div className="flex items-center justify-center py-20">
                      <LoadingSpinner message="Loading Projects..." />
                    </div>
                ) : (`;

code = code.replace(oldLoadingProjects, newLoadingProjects);

fs.writeFileSync('App.tsx', code);
