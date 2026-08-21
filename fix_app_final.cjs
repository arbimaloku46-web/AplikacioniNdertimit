const fs = require('fs');

let lines = fs.readFileSync('App_recovered.tsx', 'utf8').split('\n');

// Find the start of the return statement
let returnIdx = -1;
for (let i = 700; i < 750; i++) {
  if (lines[i].includes('  return (')) {
    if (lines[i+1] && lines[i+1].includes('    <div')) {
      returnIdx = i;
      break;
    }
  }
}

if (returnIdx === -1) {
  console.log("Could not find return statement");
  process.exit(1);
}

let prefix = lines.slice(0, returnIdx).join('\n');

// Fix imports
prefix = prefix.replace(/Box, MessageCircle, LayoutGrid/, "Box, MessageCircle, Calendar");

const suffix = `  return (
    <div
      className="bg-brand-dark min-h-screen font-sans text-slate-500 pb-20 md:pb-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={handleCropComplete}
        />
      )}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-center">
          <WifiOff className="w-4 h-4 mr-2" />
          <span>You are offline.</span>
        </div>
      )}

      {currentView === AppView.HOME && (
        <div className="flex flex-col min-h-screen pb-24 md:pb-0">
          {renderHeader()}
          <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-semibold text-white leading-tight">
                  {isAdmin ? "Management" : "Progress"} <span className="text-brand-blue">Suite</span>
                </h1>
                <p className="text-slate-500 mt-2 text-sm md:text-base">Active construction projects & site monitoring.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-900/50 rounded-md p-1 border border-white/5">
                  <button className={\`p-2 rounded-lg \${projectListView === "grid" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}\`} onClick={() => setProjectListView("grid")}>
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button className={\`p-2 rounded-lg \${projectListView === "list" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}\`} onClick={() => setProjectListView("list")}>
                    <List className="w-5 h-5" />
                  </button>
                </div>
                {isAdmin && (
                  <Button onClick={() => setShowCreateProject(true)}>{text.addNewProject}</Button>
                )}
              </div>
            </div>

            {loadingProjects ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
              </div>
            ) : (
              <div className={projectListView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "grid grid-cols-1 gap-4"}>
                {activeProjectsList.map((p, i) => (
                  <motion.div
                    key={p.id}
                    onClick={() => handleProjectSelect(p)}
                    className={\`group bg-slate-900/40 rounded-lg overflow-hidden border border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all \${projectListView === "list" ? "flex items-center p-4 gap-6" : ""}\`}
                  >
                    <div className={\`relative overflow-hidden \${projectListView === "list" ? "w-32 h-24 shrink-0 rounded-md" : "aspect-video"}\`}>
                      <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                    <div className={\`\${projectListView === "list" ? "flex-1" : "p-6"}\`}>
                      <h3 className="text-xl font-semibold text-white group-hover:text-brand-blue transition-colors">{p.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{p.clientName} • {p.location}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {currentView === AppView.PROJECT_DETAIL && activeProject && (
        <div className="flex flex-col min-h-screen pb-24 md:pb-0 relative">
          {projectTab !== 'explore' && renderHeader()}

          {/* Wall Tab */}
          {projectTab === 'wall' && (
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-8 md:py-10">
              <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-display font-semibold text-white">{activeProject.name}</h1>
                  <p className="text-slate-500 mt-2">{activeProject.location}</p>
                </div>
                {isAdmin && (
                  <Button onClick={() => setIsAddingWeek(true)}>Add Update</Button>
                )}
              </div>
              
              {activeProject.updates && activeProject.updates.length > 0 && activeProject.updates[activeUpdateIndex] ? (
                <div className="space-y-12">
                  <div className="bg-slate-900/50 rounded-xl p-6 md:p-8 border border-white/5">
                    <h2 className="text-xl font-semibold text-white mb-4">{activeProject.updates[activeUpdateIndex].title}</h2>
                    <p className="text-slate-400 mb-6">{activeProject.updates[activeUpdateIndex].summary}</p>
                    
                    <MediaGrid
                      items={activeProject.updates[activeUpdateIndex].media || []}
                      onFullScreenChange={setIsFullScreenMode}
                      isAdmin={isAdmin}
                    />
                  </div>
                  
                  {/* Weather Widget */}
                  {activeProject.updates[activeUpdateIndex].stats && (
                    <WeatherWidget 
                      conditions={activeProject.updates[activeUpdateIndex].stats.weatherConditions || 'Clear'} 
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-white/5">
                  <p className="text-slate-500">No updates published yet.</p>
                </div>
              )}
              
              <div className="mt-20">
                <Footer />
              </div>
            </main>
          )}

          {/* Explore Tab (Interactive Building / 3D) */}
          {projectTab === 'explore' && (
            <div className="absolute inset-0 bg-brand-dark pt-safe z-10">
              <InteractiveViewer data={activeProject.interactiveBuilding || DEMO_INTERACTIVE_BUILDING} />
            </div>
          )}

          {/* Discussion Tab */}
          {projectTab === 'discussion' && (
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 py-8 md:py-10">
              <h2 className="text-2xl font-semibold text-white mb-6">Weekly Discussion</h2>
              <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden shadow-md">
                {user && activeProject.updates && activeProject.updates[activeUpdateIndex] ? (
                  <div className="p-6 md:p-8">
                    <UpdateComments
                      comments={activeProject.updates[activeUpdateIndex].comments || []}
                      currentUser={user}
                      onAddComment={handleAddComment}
                    />
                  </div>
                ) : (
                  <div className="p-6 text-slate-500">No update selected.</div>
                )}
              </div>
            </main>
          )}

          {/* Calendar Tab */}
          {projectTab === 'calendar' && (
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-8 md:py-10">
              <h2 className="text-2xl font-semibold text-white mb-6">Project Calendar</h2>
              <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden shadow-md">
                <div className="p-6 md:p-8">
                  <ProjectCalendar
                    updates={isAdmin ? (activeProject.updates || []) : (activeProject.updates || []).filter(u => u.status !== 'draft')}
                    activeIndex={activeUpdateIndex}
                    onSelect={(idx) => {
                      if (isAdmin) {
                        setActiveUpdateIndex(idx);
                        setProjectTab('wall');
                      } else {
                        const activeUpdates = (activeProject.updates || []).filter(u => u.status !== "draft");
                        const targetWeek = activeUpdates[idx]?.weekNumber;
                        const realIndex = (activeProject.updates || []).findIndex(u => u.weekNumber === targetWeek);
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
          <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 pb-safe z-[60]">
            <div className="flex items-center justify-around p-3 max-w-md mx-auto">
              {[
                { id: 'wall', icon: LayoutGrid, label: 'Wall' },
                { id: 'explore', icon: Box, label: 'Explore' },
                { id: 'discussion', icon: MessageCircle, label: 'Discussion' },
                { id: 'calendar', icon: Calendar, label: 'Calendar' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProjectTab(tab.id)}
                  className={\`flex flex-col items-center gap-1 p-2 rounded-lg transition-all \${projectTab === tab.id ? 'text-brand-blue' : 'text-slate-500 hover:text-white'}\`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView === AppView.MAPPER && user?.isAdmin && activeProject && (
        <div className="min-h-screen bg-brand-dark overflow-y-auto">
          {renderHeader()}
          <div className="pt-20 px-6 md:px-8 pb-12">
            <BuildingConfigurator
              initialData={activeProject.interactiveBuilding || DEMO_INTERACTIVE_BUILDING}
              onSave={async (updatedBuilding) => {
                const updatedProject = { ...activeProject, interactiveBuilding: updatedBuilding };
                await dbService.updateProject(updatedProject);
                setActiveProject(updatedProject);
                setCurrentView(AppView.PROJECT_DETAIL);
              }}
              onClose={() => setCurrentView(AppView.PROJECT_DETAIL)}
            />
          </div>
        </div>
      )}

      {currentView === AppView.PROFILE && user && (
        <div className="flex flex-col min-h-screen">
          {renderHeader()}
          <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-12">
            <h1 className="text-3xl font-semibold text-white mb-8">Profile</h1>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5">
              <p className="text-white">Logged in as {user.name}</p>
              <Button className="mt-4" onClick={() => logoutUser()}>Logout</Button>
            </div>
          </main>
        </div>
      )}

      {currentView !== AppView.PROJECT_DETAIL && currentView !== AppView.MAPPER && (
        <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} text={text} />
      )}
    </div>
  );
};

export default App;
`;

fs.writeFileSync('App.tsx', prefix + '\n' + suffix);
console.log("App.tsx rewritten successfully.");
