const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const regex = /\{loadingProjects \? \(\s*<div className="flex items-center justify-center py-20">\s*<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"><\/div>\s*<\/div>\s*\) : \(/g;

const newStr = `{loadingProjects ? (
                    <div className="flex items-center justify-center py-20 h-64">
                      <LoadingSpinner message="Loading Projects..." />
                    </div>
                ) : (`;

code = code.replace(regex, newStr);

fs.writeFileSync('App.tsx', code);
