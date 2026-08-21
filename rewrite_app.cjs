const fs = require('fs');

let lines = fs.readFileSync('App_recovered.tsx', 'utf8').split('\n');

// 1. Extract prefix up to renderHeader (line 586)
let prefix = lines.slice(0, 586).join('\n');
prefix = prefix.replace(/<\/div>/g, ''); // Remove all stray </div> tags in logic

// 2. Fix imports to include Calendar
prefix = prefix.replace(/Box, MessageCircle, LayoutGrid/, "Box, MessageCircle, Calendar, LayoutGrid");

// 3. New UI components starting with renderHeader
const suffix = `
  const renderHeader = () => {
    if (isFullScreenMode) return null;
    return (
      <header className="bg-brand-dark/95 border-b border-white/5 sticky top-0 z-50 h-16 flex items-center shadow-sm transition-all animate-in fade-in duration-300">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentView !== AppView.HOME ? (
              <button
                onClick={() => {
                  setActiveProject(null);
                  setCurrentView(AppView.HOME);
                }}
                className="p-2 -ml-2 rounded-full text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-sm font-semibold tracking-normal md:hidden">Back</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}>
                <Logo className="h-8 md:h-10" />
              </div>
            )}
            
            {currentView !== AppView.HOME && (
              <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm border-l border-white/10 pl-4 ml-2">
                <span onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }} className="cursor-pointer hover:text-white transition-all duration-300 ease-in-out">
                  Home
                </span>
                <span>/</span>
                <span className="text-white font-medium truncate max-w-[200px]">
                  {activeProject ? activeProject.name : text.profileTitle}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-5">
            <InstallButton language={language} />
            <button onClick={() => setCurrentView(AppView.PROFILE)} className={\`p-2 rounded-full transition-all duration-300 ease-in-out \${currentView === AppView.PROFILE ? "bg-brand-blue text-white" : "bg-white/5 text-slate-500 hover:text-white"}\`}>
              <User className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="hidden md:block p-2 rounded-full bg-white/5 text-slate-500 hover:text-red-400 transition-all duration-300 ease-in-out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    );
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white">
        <WifiOff className="w-16 h-16 mb-4 text-slate-500" />
        <h1 className="text-xl font-bold">Offline</h1>
        <p className="text-slate-500 mt-2 text-center">You are currently offline.</p>
      </div>
    );
  }

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white">
        <div className="mb-6 animate-pulse">
          <Logo className="h-16" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue mb-4"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <GlobalAuth
        onLogin={(u) => setUser(u)}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-slate-500 pb-20 md:pb-0" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {cropImageSrc && (
        <ImageCropperModal imageSrc={cropImageSrc} onClose={() => setCropImageSrc(null)} onCropComplete={handleCropComplete} />
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

          {/* Explore Tab */}
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
