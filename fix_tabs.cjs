const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// 1. Remove the grid containing Weekly Discussion Tab and Project Calendar Tab
const gridStart = '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">';
const nextSectionMatch = code.indexOf(gridStart);

if (nextSectionMatch !== -1) {
    let nestLevel = 0;
    let gridEnd = -1;
    for (let i = nextSectionMatch; i < code.length; i++) {
        if (code.substr(i, 4) === '<div') nestLevel++;
        else if (code.substr(i, 5) === '</div') nestLevel--;
        
        if (nestLevel === 0 && code.substr(i, 6) === '</div>') {
            gridEnd = i + 6;
            break;
        }
    }
    
    if (gridEnd !== -1) {
        code = code.substring(0, nextSectionMatch) + code.substring(gridEnd);
    }
}

// 2. Change the conditional rendering of the main Project layout
code = code.replace(
  /<main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10 relative z-0">/,
  `{projectTab === 'wall' && (
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10 relative z-0">`
);

// Close the <main> block for 'wall'
code = code.replace(
  /<\/main>{" "}\s*<Footer \/>{" "}\s*<\/div>\s*\)\}{" "}/,
  `</main>
      )}
      
      {projectTab === 'explore' && (
        <div className="absolute inset-0 bg-brand-dark pt-safe">
          <InteractiveViewer
            data={activeProject.interactiveBuilding || DEMO_INTERACTIVE_BUILDING}
          />
        </div>
      )}

      {projectTab === 'discussion' && (
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10 relative z-0 pb-24">
          <h2 className="text-2xl font-semibold tracking-normal text-white mb-6">Weekly Discussion</h2>
          <div className="bg-slate-900/50 border border-white/5 rounded-lg overflow-hidden shadow-md">
            {user && activeProject.updates[activeUpdateIndex] ? (
              <div className="p-6 md:p-8">
                <UpdateComments
                  comments={activeProject.updates[activeUpdateIndex].comments || []}
                  currentUser={user}
                  onAddComment={handleAddComment}
                />
              </div>
            ) : (
              <div className="p-6 text-slate-500">No update selected or user not logged in.</div>
            )}
          </div>
        </main>
      )}

      {projectTab === 'calendar' && (
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10 relative z-0 pb-24">
          <h2 className="text-2xl font-semibold tracking-normal text-white mb-6">Project Calendar</h2>
          <div className="bg-slate-900/50 border border-white/5 rounded-lg overflow-hidden shadow-md">
            <div className="p-6 md:p-8">
              <ProjectCalendar
                updates={
                  isAdmin
                    ? activeProject.updates
                    : activeProject.updates.filter((u) => u.status !== "draft")
                }
                activeIndex={
                  isAdmin
                    ? activeUpdateIndex
                    : activeProject.updates
                        .filter((u) => u.status !== "draft")
                        .findIndex((u) => u.weekNumber === activeProject.updates[activeUpdateIndex]?.weekNumber)
                }
                onSelect={(index) => {
                  if (isAdmin) {
                    setActiveUpdateIndex(index);
                    setProjectTab('wall');
                  } else {
                    const activeUpdates = activeProject.updates.filter((u) => u.status !== "draft");
                    const targetWeek = activeUpdates[index]?.weekNumber;
                    const realIndex = activeProject.updates.findIndex((u) => u.weekNumber === targetWeek);
                    if (realIndex !== -1) {
                      setActiveUpdateIndex(realIndex);
                      setProjectTab('wall');
                    }
                  }
                }}
              />
            </div>
          </div>
        </main>
      )}

      {/* Project Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
        <div className="flex items-center justify-around p-3 md:px-8 max-w-7xl mx-auto">
          <button
            onClick={() => setProjectTab('wall')}
            className={\`flex flex-col items-center gap-1 p-2 rounded-lg transition-all \${
              projectTab === 'wall'
                ? 'text-brand-blue'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }\`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-semibold tracking-normal">Wall</span>
          </button>
          <button
            onClick={() => setProjectTab('explore')}
            className={\`flex flex-col items-center gap-1 p-2 rounded-lg transition-all \${
              projectTab === 'explore'
                ? 'text-brand-blue'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Box className="w-6 h-6" />
            <span className="text-[10px] font-semibold tracking-normal">Explore</span>
          </button>
          <button
            onClick={() => setProjectTab('discussion')}
            className={\`flex flex-col items-center gap-1 p-2 rounded-lg transition-all \${
              projectTab === 'discussion'
                ? 'text-brand-blue'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }\`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-semibold tracking-normal">Discussion</span>
          </button>
          <button
            onClick={() => setProjectTab('calendar')}
            className={\`flex flex-col items-center gap-1 p-2 rounded-lg transition-all \${
              projectTab === 'calendar'
                ? 'text-brand-blue'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-semibold tracking-normal">Calendar</span>
          </button>
        </div>
      </div>
      
      {projectTab === 'wall' && <Footer />}
    </div>
  )}`
);

fs.writeFileSync('App.tsx', code);
