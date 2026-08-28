const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
    /\{\!isAdmin && \(\!activeProject\.updates\[activeUpdateIndex\] \|\| activeProject\.updates\[activeUpdateIndex\]\.status === 'draft'\) \? \(/g,
    "{(!activeProject.updates[activeUpdateIndex] || (!isAdmin && activeProject.updates[activeUpdateIndex].status === 'draft')) ? ("
);

// We should also change the text inside that placeholder based on isAdmin
const oldPlaceholder = `<h3 className="text-xl font-extrabold tracking-tight text-white mb-2">No Updates Published</h3>
                        <p className="text-slate-500 max-w-md mx-auto">The project manager has not published any weekly updates for this project yet. Please check back later.</p>`;
const newPlaceholder = `<h3 className="text-xl font-extrabold tracking-tight text-white mb-2">{isAdmin ? "No Updates Yet" : "No Updates Published"}</h3>
                        <p className="text-slate-500 max-w-md mx-auto">{isAdmin ? "Click the '+' button above to create the first weekly update for this project." : "The project manager has not published any weekly updates for this project yet. Please check back later."}</p>`;

code = code.replace(oldPlaceholder, newPlaceholder);

fs.writeFileSync('App.tsx', code);
console.log('Patched condition');
