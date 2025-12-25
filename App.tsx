
import React, { useState, useEffect, useRef } from 'react';
import { Project, MediaItem, AppView, WeeklyUpdate, User } from './types';
import { LoginScreen } from './components/LoginScreen';
import { GlobalAuth } from './components/GlobalAuth';
import { Button } from './components/Button';
import { SplatViewer } from './components/SplatViewer';
import { MediaGrid } from './components/MediaGrid';
import { Footer } from './components/Footer';
import { InstallButton } from './components/InstallButton';
import { Language, translations } from './translations';
import { dbService } from './services/db';
import { logoutUser } from './services/authService';
import { supabase } from './services/supabaseClient';

const STORAGE_UNLOCKED_KEY = 'ndertimi_unlocked_projects';
const STORAGE_LANGUAGE_KEY = 'ndertimi_language_pref';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // New state for loading auth
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [language, setLanguage] = useState<Language>('en');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);
  const [activeUpdateIndex, setActiveUpdateIndex] = useState<number>(0);
  const [heroTab, setHeroTab] = useState<'3d' | '360'>('3d');
  
  const isAdmin = user?.isAdmin || false;
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAddingWeek, setIsAddingWeek] = useState(false);

  // Admin Edit State
  const [newMediaCategory, setNewMediaCategory] = useState<'inside' | 'outside' | 'drone' | 'interior' | 'other'>('outside');
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');

  const [newProjectForm, setNewProjectForm] = useState({
    name: '', clientName: '', location: '', accessCode: '', description: '', thumbnailUrl: ''
  });

  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Keep a ref of the active project ID to sync real-time updates correctly
  const activeProjectIdRef = useRef<string | null>(null);
  useEffect(() => { 
    activeProjectIdRef.current = activeProject?.id || null; 
  }, [activeProject]);

  const text = translations[language];

  // Touch Handlers for Swipe Back
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    // Only trigger swipe back if starting from the left 20% of screen (iOS style)
    // and if we are not in Home view
    if (currentView !== AppView.HOME && e.targetTouches[0].clientX < window.innerWidth * 0.2) {
         setTouchStart(e.targetTouches[0].clientX);
    } else {
         setTouchStart(null);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
     if (touchStart) setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -75; // Negative distance means moving right
    
    if (isRightSwipe && currentView !== AppView.HOME) {
        // Trigger Back
        setActiveProject(null);
        setCurrentView(AppView.HOME);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 1. Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const appMetadata = session.user.app_metadata || {};
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          name: metadata.full_name || metadata.name || 'User',
          username: metadata.username || session.user.email?.split('@')[0] || 'user',
          photoURL: metadata.avatar_url || metadata.picture || null,
          isAdmin: appMetadata.is_admin === true || metadata.is_admin === true,
          countryCode: metadata.country_code
        });
      }
      setIsAuthChecking(false); // Initial check done
    });

    // 2. Listen for auth changes (Login, Logout, OAuth Redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         const metadata = session.user.user_metadata || {};
         const appMetadata = session.user.app_metadata || {};
         setUser({
          uid: session.user.id,
          email: session.user.email || null,
          name: metadata.full_name || metadata.name || 'User',
          username: metadata.username || session.user.email?.split('@')[0] || 'user',
          photoURL: metadata.avatar_url || metadata.picture || null,
          isAdmin: appMetadata.is_admin === true || metadata.is_admin === true,
          countryCode: metadata.country_code
        });
        
        // Clear hash from URL if present (cleaner URL after OAuth redirect)
        if (window.location.hash && window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setUser(null);
        setCurrentView(AppView.HOME);
        setActiveProject(null);
      }
      setIsAuthChecking(false); // State change handled
    });

    const unsubscribeDB = dbService.subscribeProjects((data) => {
        setProjects(data);
        setLoadingProjects(false);
        if (activeProjectIdRef.current) {
            const updated = data.find(p => p.id === activeProjectIdRef.current);
            if (updated) {
                setActiveProject(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(updated)) return updated;
                    return prev;
                });
            }
        }
    });

    const storedUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    if (storedUnlocked) setUnlockedProjectIds(JSON.parse(storedUnlocked));

    const storedLang = localStorage.getItem(STORAGE_LANGUAGE_KEY);
    if (storedLang === 'en' || storedLang === 'sq') setLanguage(storedLang as Language);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscription.unsubscribe();
      unsubscribeDB();
    };
  }, []);

  useEffect(() => {
    const processQueue = async () => {
      const pendingItem = uploadQueue.find(item => item.status === 'pending');
      if (!pendingItem || !activeProject) return;

      setUploadQueue(prev => prev.map(item => item.id === pendingItem.id ? { ...item, status: 'uploading' } : item));

      try {
        const downloadUrl = await dbService.uploadFile(
            pendingItem.file, 
            activeProject.id, 
            (progress) => {
                setUploadQueue(prev => prev.map(item => 
                    item.id === pendingItem.id ? { ...item, progress } : item
                ));
            }
        );
        
        const type = pendingItem.file.type.startsWith('video') ? 'video' : 'photo';
        const newItem: MediaItem = {
            id: Date.now().toString() + Math.random().toString(),
            type: type,
            url: downloadUrl,
            description: pendingItem.file.name.split('.')[0],
            category: newMediaCategory
        };

        const updatedUpdates = [...activeProject.updates];
        updatedUpdates[activeUpdateIndex] = {
            ...updatedUpdates[activeUpdateIndex],
            media: [newItem, ...updatedUpdates[activeUpdateIndex].media]
        };
        const newProjectState = { ...activeProject, updates: updatedUpdates };
        setActiveProject(newProjectState); 
        await dbService.updateProject(newProjectState);
        setUploadQueue(prev => prev.map(item => item.id === pendingItem.id ? { ...item, status: 'completed', progress: 100 } : item));
      } catch (error) {
        console.error("Upload error:", error);
        setUploadQueue(prev => prev.map(item => item.id === pendingItem.id ? { ...item, status: 'error' } : item));
      }
    };

    // Sequential Upload Processing
    const currentlyUploading = uploadQueue.some(i => i.status === 'uploading');
    if (!currentlyUploading && uploadQueue.some(i => i.status === 'pending')) {
        processQueue();
    }
  }, [uploadQueue, activeProject, activeUpdateIndex, newMediaCategory]);

  const handleLogout = async () => {
      await logoutUser();
      setUser(null);
      setCurrentView(AppView.HOME);
  };

  const handleProjectSelect = (project: Project) => {
    if (isAdmin || unlockedProjectIds.includes(project.id)) {
        setActiveProject(project);
        setActiveUpdateIndex(0);
        setCurrentView(AppView.PROJECT_DETAIL);
    } else {
        setPendingProject(project);
    }
  };

  const handleAuthenticationSuccess = () => {
    if (pendingProject) {
      const newUnlocked = [...unlockedProjectIds, pendingProject.id];
      setUnlockedProjectIds(newUnlocked);
      localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(newUnlocked));
      setActiveProject(pendingProject);
      setActiveUpdateIndex(0);
      setPendingProject(null);
      setCurrentView(AppView.PROJECT_DETAIL);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingProject(true);
    const newProject: Project = {
        id: `p_${Date.now()}`,
        ...newProjectForm,
        thumbnailUrl: newProjectForm.thumbnailUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000',
        updates: [{
            weekNumber: 1, date: new Date().toISOString().split('T')[0], title: 'Project Start', summary: 'Initial setup.', media: [],
            stats: { completion: 0, workersOnSite: 0, weatherConditions: 'N/A' }
        }]
    };
    try {
        await dbService.addProject(newProject);
        setShowCreateProject(false);
        setNewProjectForm({ name: '', clientName: '', location: '', accessCode: '', description: '', thumbnailUrl: '' });
    } catch (err: any) { alert(err.message); }
    finally { setIsCreatingProject(false); }
  };

  const handleAddNewWeek = async () => {
    if (!activeProject) return;
    setIsAddingWeek(true);
    try {
        const latestWeek = activeProject.updates.length > 0 ? Math.max(...activeProject.updates.map(u => u.weekNumber)) : 0;
        const newUpdate: WeeklyUpdate = {
            weekNumber: latestWeek + 1, date: new Date().toISOString().split('T')[0], title: `Week ${latestWeek + 1}`, summary: '', media: [],
            stats: { completion: activeProject.updates[0]?.stats.completion || 0, workersOnSite: 0, weatherConditions: 'Sunny' }
        };
        const updatedProject = { ...activeProject, updates: [newUpdate, ...activeProject.updates] };
        setActiveProject(updatedProject);
        await dbService.updateProject(updatedProject);
        setActiveUpdateIndex(0);
    } catch (err: any) { alert(err.message); }
    finally { setIsAddingWeek(false); }
  };

  const extractUrlFromEmbed = (input: string) => {
    if (!input) return '';
    const srcMatch = input.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : input;
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!activeProject) return;
    const updatedUpdates = [...activeProject.updates];
    const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
    
    if (field.startsWith('stats.')) {
        const statKey = field.split('.')[1];
        currentUpdate.stats = { ...currentUpdate.stats, [statKey]: value };
    } else { (currentUpdate as any)[field] = value; }
    
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };
    setActiveProject(updatedProject);
    try { await dbService.updateProject(updatedProject); } catch {}
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
        const { error } = await supabase.auth.updateUser({ data: { full_name: editName } });
        if (error) throw error;
        setUser({...user, name: editName});
        setIsEditingProfile(false);
    } catch (err: any) { alert('Failed to update profile: ' + err.message); }
  };

  // Mobile-Optimized Header
  const renderHeader = () => (
    <header className="bg-brand-dark/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 h-16 flex items-center shadow-lg transition-all">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
                {currentView !== AppView.HOME ? (
                    <button 
                        onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}
                        className="p-2 -ml-2 rounded-full text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        <span className="text-sm font-bold md:hidden">Back</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}>
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-xl flex items-center justify-center shadow-xl"><span className="font-display font-bold text-brand-blue text-lg md:text-xl">N</span></div>
                        <span className="font-display font-bold text-white text-base md:text-lg tracking-tight">Shiko Progresin</span>
                    </div>
                )}
                
                {/* Desktop Breadcrumb for Non-Home */}
                {currentView !== AppView.HOME && (
                    <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm border-l border-white/10 pl-4 ml-2">
                        <span onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }} className="cursor-pointer hover:text-white transition-colors">Home</span>
                        <span>/</span>
                        <span className="text-white font-medium truncate max-w-[200px]">{activeProject ? activeProject.name : text.profileTitle}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-5">
                <InstallButton language={language} />
                <button 
                    onClick={() => setCurrentView(AppView.PROFILE)} 
                    className={`p-2 rounded-full transition-colors ${currentView === AppView.PROFILE ? 'bg-brand-blue text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </button>
                {/* Hide logout on mobile to save space, it is available in profile */}
                <button onClick={handleLogout} className="hidden md:block p-2 rounded-full bg-white/5 text-slate-400 hover:text-red-400 transition-colors" title={text.logout}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" /></svg>
                </button>
            </div>
        </div>
    </header>
  );

  if (!isOnline) return <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white"><h1>Offline</h1></div>;
  
  // New: Show loading screen while checking auth session to prevent flash of login screen
  if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white">
            <div className="w-16 h-16 bg-white rounded flex items-center justify-center shadow-lg mb-6 animate-pulse">
                <span className="font-display font-bold text-brand-blue text-3xl">N</span>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue mb-4"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Establishing Secure Connection...</p>
        </div>
      );
  }

  if (!user) return <GlobalAuth onLogin={(u) => setUser(u)} language={language} setLanguage={setLanguage} />;

  return (
    <div 
        className="bg-brand-dark min-h-screen font-sans text-slate-200"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      {pendingProject && <LoginScreen targetProject={pendingProject} onLogin={handleAuthenticationSuccess} onCancel={() => setPendingProject(null)} />}
      
      {showCreateProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
             <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8">
                <h2 className="text-2xl font-bold text-white mb-8">New Project Entry</h2>
                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Project Name</label><input required className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-white" value={newProjectForm.name} onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Client</label><input required className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-white" value={newProjectForm.clientName} onChange={e => setNewProjectForm({...newProjectForm, clientName: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Location</label><input required className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-white" value={newProjectForm.location} onChange={e => setNewProjectForm({...newProjectForm, location: e.target.value})} /></div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-8">
                        <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isCreatingProject}>Initialize Project</Button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {currentView === AppView.HOME && (
        <div className="min-h-screen flex flex-col">
            {renderHeader()}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                            {isAdmin ? 'Management' : 'Progress'} <span className="text-brand-blue">Suite</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm md:text-base">Active construction projects & site monitoring.</p>
                    </div>
                    {isAdmin && <Button onClick={() => setShowCreateProject(true)}>{text.addNewProject}</Button>}
                </div>
                {loadingProjects ? (
                    <div className="flex items-center justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                    </div>
                ) : (
                    <>
                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.map(p => (
                                    <div key={p.id} onClick={() => handleProjectSelect(p)} className="group bg-slate-900/40 rounded-3xl overflow-hidden border border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all hover:-translate-y-1 active:scale-[0.98]">
                                        <div className="aspect-video relative overflow-hidden">
                                        <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                        </div>
                                        <div className="p-6 md:p-8">
                                            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-brand-blue transition-colors">{p.name}</h3>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{p.clientName} • {p.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                                <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{text.noProjectsTitle}</h3>
                                <p className="text-slate-500 max-w-md mx-auto">{isAdmin ? text.noProjectsDescAdmin : text.noProjectsDescClient}</p>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
      )}

      {currentView === AppView.PROJECT_DETAIL && activeProject && (
         <div className="min-h-screen bg-brand-dark pb-32">
            {renderHeader()}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 relative z-0">
                {/* Project Header - Mobile Optimized */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-white leading-tight mb-2">{activeProject.name}</h1>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           {activeProject.location}
                        </p>
                    </div>
                    {/* Progress Bar - Compact on Mobile */}
                    <div className="bg-white/5 border border-white/5 px-5 py-3 rounded-2xl backdrop-blur-sm flex items-center justify-between md:block w-full md:w-auto">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-0 md:mb-1 mr-4 md:mr-0">Total Progress</span>
                        <div className="flex items-center gap-4">
                           <div className="text-2xl md:text-3xl font-bold text-white">{activeProject.updates[activeUpdateIndex].stats.completion}%</div>
                           <div className="w-20 md:w-24 h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: `${activeProject.updates[activeUpdateIndex].stats.completion}%` }} />
                           </div>
                        </div>
                    </div>
                </div>

                {/* Week Selector - Swipable */}
                <div className="flex gap-3 overflow-x-auto pb-6 mb-8 no-scrollbar snap-x">
                    {isAdmin && <button onClick={handleAddNewWeek} disabled={isAddingWeek} className="min-w-[80px] md:min-w-[120px] h-16 md:h-20 border-2 border-dashed border-brand-blue/30 rounded-2xl md:rounded-3xl flex items-center justify-center text-brand-blue hover:bg-brand-blue/5 transition-all text-xl shrink-0 snap-start">+</button>}
                    {activeProject.updates.map((u, i) => (
                        <button key={i} onClick={() => setActiveUpdateIndex(i)} className={`min-w-[130px] md:min-w-[160px] p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left group shrink-0 snap-start ${i === activeUpdateIndex ? 'border-brand-blue bg-brand-blue/10 shadow-[0_10px_30px_rgba(34,100,171,0.1)]' : 'border-white/5 bg-slate-900/40 hover:bg-slate-900'}`}>
                            <span className="text-[8px] md:text-[9px] block text-slate-500 font-bold uppercase tracking-widest mb-1">Update {u.weekNumber}</span>
                            <span className={`text-xs md:text-sm font-bold block ${i === activeUpdateIndex ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{u.date}</span>
                        </button>
                    ))}
                </div>

                {/* Hero Experience Suite */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-16 relative z-10">
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        <div className="flex flex-col gap-4 md:gap-6">
                           <div className="flex items-center justify-between">
                              {/* Mobile Optimized Segmented Control */}
                              <div className="flex bg-slate-900/80 p-1 rounded-xl md:rounded-2xl border border-white/5 w-full md:w-auto">
                                 <button onClick={() => setHeroTab('3d')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${heroTab === '3d' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'}`}>3D Model</button>
                                 <button onClick={() => setHeroTab('360')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${heroTab === '360' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'}`}>360 Tour</button>
                              </div>
                           </div>
                           <div className="relative">
                              {heroTab === '3d' ? (
                                <SplatViewer type="3d" url={activeProject.updates[activeUpdateIndex].splatUrl} title="Polycam 3D Render" />
                              ) : (
                                <SplatViewer type="360" url={activeProject.updates[activeUpdateIndex].floorfyUrl} title="Floorfy 360 Tour" />
                              )}
                           </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="pt-8 md:pt-10 border-t border-white/5">
                           <h2 className="text-lg md:text-xl font-display font-bold text-white mb-6 md:mb-8">Site Footage Gallery</h2>
                           <MediaGrid media={activeProject.updates[activeUpdateIndex].media} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8 relative z-20">
                        {/* Site Stats & Summary */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative z-30 shadow-2xl">
                            <h3 className="text-[10px] uppercase font-bold text-brand-blue mb-6 tracking-widest">Executive Update</h3>
                            
                            {isAdmin ? (
                                <div className="space-y-6">
                                    {/* Admin Inputs - Kept same structure */}
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">3D Polycam Embed</label>
                                        <input 
                                            className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-brand-blue" 
                                            value={activeProject.updates[activeUpdateIndex].splatUrl || ''} 
                                            onChange={e => handleUpdateField('splatUrl', extractUrlFromEmbed(e.target.value))} 
                                            placeholder="URL..." 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">360 Floorfy Embed</label>
                                        <input 
                                            className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-brand-blue" 
                                            value={activeProject.updates[activeUpdateIndex].floorfyUrl || ''} 
                                            onChange={e => handleUpdateField('floorfyUrl', extractUrlFromEmbed(e.target.value))} 
                                            placeholder="URL..." 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Completion %</label><input type="number" className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-sm" value={activeProject.updates[activeUpdateIndex].stats.completion} onChange={e => handleUpdateField('stats.completion', parseInt(e.target.value))} /></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Workers</label><input type="number" className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-sm" value={activeProject.updates[activeUpdateIndex].stats.workersOnSite} onChange={e => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))} /></div>
                                    </div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Narrative</label><textarea className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 h-32 resize-none text-sm" value={activeProject.updates[activeUpdateIndex].summary} onChange={e => handleUpdateField('summary', e.target.value)} /></div>
                                </div>
                            ) : (
                                <div className="space-y-6 md:space-y-8">
                                    <div>
                                       <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">{activeProject.updates[activeUpdateIndex].title}</h2>
                                       <p className="text-sm text-slate-400 mt-4 leading-relaxed whitespace-pre-line">{activeProject.updates[activeUpdateIndex].summary || 'No summary notes for this week.'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 md:pt-8 border-t border-white/5">
                                        <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                          <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Weather</span>
                                          <span className="text-white text-xs font-bold">{activeProject.updates[activeUpdateIndex].stats.weatherConditions}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                          <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Workforce</span>
                                          <span className="text-white text-xs font-bold">{activeProject.updates[activeUpdateIndex].stats.workersOnSite} Active</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Media Uploader */}
                        {isAdmin && (
                           <div className="bg-slate-900/80 border border-brand-blue/20 rounded-3xl p-6 md:p-8">
                               <h4 className="text-[10px] uppercase font-bold text-brand-blue mb-4 md:mb-6 tracking-widest">Media Upload Lab</h4>
                               <div className="space-y-6">
                                  <div>
                                     <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Tag</label>
                                     <select value={newMediaCategory} onChange={(e) => setNewMediaCategory(e.target.value as any)} className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs">
                                        <option value="outside">Outside / Drone</option>
                                        <option value="inside">Inside / Structural</option>
                                        <option value="interior">Interior Finishing</option>
                                        <option value="drone">Drone Mapping</option>
                                        <option value="other">Other</option>
                                     </select>
                                  </div>
                                  <div className="border-2 border-dashed border-white/10 p-6 rounded-2xl text-center relative hover:border-brand-blue/50 transition-colors">
                                     <input type="file" multiple accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={(e) => {
                                        if (e.target.files) {
                                           const files = Array.from(e.target.files).map(f => ({ id: Math.random().toString(), file: f, progress: 0, status: 'pending' as const }));
                                           setUploadQueue(prev => [...prev, ...files]);
                                        }
                                     }} />
                                     <div className="pointer-events-none">
                                        <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Click or Drag to Upload (Max 1.5GB)</p>
                                     </div>
                                  </div>
                                  
                                  {/* Upload Queue List */}
                                  {uploadQueue.length > 0 && (
                                      <div className="space-y-3 mt-4">
                                          {uploadQueue.map(item => (
                                              <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-3 overflow-hidden">
                                                         <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                                                             {item.file.type.startsWith('video') ? (
                                                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                             ) : (
                                                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                             )}
                                                         </div>
                                                         <span className="text-xs text-slate-300 font-medium truncate">{item.file.name}</span>
                                                      </div>
                                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                          item.status === 'completed' ? 'text-emerald-500' : 
                                                          item.status === 'error' ? 'text-red-500' : 
                                                          'text-brand-blue'
                                                      }`}>
                                                          {item.status === 'completed' ? 'Done' : item.status === 'error' ? 'Failed' : `${Math.round(item.progress)}%`}
                                                      </span>
                                                  </div>
                                                  {/* Progress Bar */}
                                                  {(item.status === 'uploading' || item.status === 'pending') && (
                                                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden w-full">
                                                          <div 
                                                              className="h-full bg-brand-blue transition-all duration-300 ease-out"
                                                              style={{ width: `${item.progress}%` }}
                                                          />
                                                      </div>
                                                  )}
                                              </div>
                                          ))}
                                          
                                          {/* Clear Finished Button */}
                                          {uploadQueue.some(i => i.status === 'completed' || i.status === 'error') && (
                                              <div className="flex justify-end">
                                                  <button 
                                                    onClick={() => setUploadQueue(prev => prev.filter(i => i.status === 'pending' || i.status === 'uploading'))}
                                                    className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest"
                                                  >
                                                      Clear Finished
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  )}
                               </div>
                           </div>
                        )}
                    </div>
                </div>
            </main>
         </div>
      )}

      {currentView === AppView.PROFILE && user && (
        <div className="min-h-screen flex flex-col bg-brand-dark">
            {renderHeader()}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8 md:mb-10">
                    <button onClick={() => setCurrentView(AppView.HOME)} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-2xl md:text-4xl font-display font-bold text-white">{text.profileTitle}</h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    {/* Left Column: User Card */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand-blue/20 to-transparent pointer-events-none" />
                            
                            <div className="relative mb-6 group">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-blue flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-2xl border-4 border-slate-900 overflow-hidden">
                                     {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                     ) : (
                                        <span>{user.name.charAt(0).toUpperCase()}</span>
                                     )}
                                </div>
                            </div>
                            {/* ... Rest of profile ... */}
                            {isEditingProfile ? (
                                <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
                                    <input className="w-full bg-slate-950 border border-brand-blue rounded-xl px-4 py-2 text-white text-center" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold">Cancel</button>
                                        <button onClick={handleSaveProfile} className="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{user.name}</h2>
                                    <p className="text-slate-400 text-xs md:text-sm mb-6 font-mono truncate max-w-full">{user.email}</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.isAdmin ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}>
                                            {user.isAdmin ? text.adminRole : text.clientRole}
                                        </span>
                                        <button onClick={() => { setEditName(user.name); setIsEditingProfile(true); }} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Account Security</h3>
                             <Button variant="secondary" onClick={handleLogout} className="w-full !bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20 hover:!border-red-500/40 justify-between group">
                                <span>{text.signOut}</span>
                                <svg className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" /></svg>
                             </Button>
                        </div>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                {text.languageSettings}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { setLanguage('en'); localStorage.setItem(STORAGE_LANGUAGE_KEY, 'en'); }} className={`relative p-4 md:p-6 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${language === 'en' ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">🇬🇧</div>
                                    <span className={`block text-xl md:text-2xl mb-2 ${language === 'en' ? 'text-white' : 'text-slate-400 grayscale'}`}>🇬🇧</span>
                                    <span className={`font-bold block text-sm md:text-base ${language === 'en' ? 'text-white' : 'text-slate-300'}`}>English</span>
                                </button>
                                <button onClick={() => { setLanguage('sq'); localStorage.setItem(STORAGE_LANGUAGE_KEY, 'sq'); }} className={`relative p-4 md:p-6 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${language === 'sq' ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">🇦🇱</div>
                                    <span className={`block text-xl md:text-2xl mb-2 ${language === 'sq' ? 'text-white' : 'text-slate-400 grayscale'}`}>🇦🇱</span>
                                    <span className={`font-bold block text-sm md:text-base ${language === 'sq' ? 'text-white' : 'text-slate-300'}`}>Shqip</span>
                                </button>
                            </div>
                        </div>

                        {!user.isAdmin && (
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    {text.myUnlockedProjects}
                                </h3>
                                
                                {projects.filter(p => unlockedProjectIds.includes(p.id)).length > 0 ? (
                                    <div className="grid gap-4">
                                        {projects.filter(p => unlockedProjectIds.includes(p.id)).map(p => (
                                            <div key={p.id} onClick={() => handleProjectSelect(p)} className="group flex items-center gap-4 md:gap-5 p-3 md:p-4 rounded-2xl bg-slate-950 border border-white/5 cursor-pointer hover:border-brand-blue/50 hover:bg-slate-900 transition-all active:scale-[0.99]">
                                                <div className="w-16 h-12 md:w-20 md:h-16 rounded-xl overflow-hidden shadow-lg relative">
                                                    <img src={p.thumbnailUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm md:text-base group-hover:text-brand-blue transition-colors">{p.name}</h4>
                                                    <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wider mt-1">{p.location}</p>
                                                </div>
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 md:py-10 px-6 rounded-2xl bg-slate-950/50 border border-dashed border-white/10">
                                        <p className="text-sm text-slate-400 mb-4">{text.noProjectsAccess}</p>
                                        <Button variant="primary" onClick={() => setCurrentView(AppView.HOME)} className="!py-2 !px-6 !text-xs">
                                            {text.browseProjects}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
      )}
    </div>
  );
};

export default App;
