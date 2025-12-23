
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

  // Keep a ref of the active project ID to sync real-time updates correctly
  const activeProjectIdRef = useRef<string | null>(null);
  useEffect(() => { 
    activeProjectIdRef.current = activeProject?.id || null; 
  }, [activeProject]);

  const text = translations[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
    });

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
      } else {
        setUser(null);
        setCurrentView(AppView.HOME);
        setActiveProject(null);
      }
    });

    const unsubscribeDB = dbService.subscribeProjects((data) => {
        setProjects(data);
        setLoadingProjects(false);
        
        // Real-time Sync Logic:
        // If we are currently viewing a project, update its state from the incoming DB data
        // to show changes made by this admin (or others) immediately.
        if (activeProjectIdRef.current) {
            const updated = data.find(p => p.id === activeProjectIdRef.current);
            if (updated) {
                setActiveProject(prev => {
                    // Only update if data actually changed to avoid cursor jumping
                    if (JSON.stringify(prev) !== JSON.stringify(updated)) {
                        return updated;
                    }
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

  // File Upload Processing
  useEffect(() => {
    const processQueue = async () => {
      const pendingItem = uploadQueue.find(item => item.status === 'pending');
      if (!pendingItem || !activeProject) return;

      setUploadQueue(prev => prev.map(item => 
        item.id === pendingItem.id ? { ...item, status: 'uploading' } : item
      ));

      try {
        const downloadUrl = await dbService.uploadFile(pendingItem.file, activeProject.id);
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
        
        // Optimistic Update: Update UI immediately before DB confirms
        const newProjectState = { ...activeProject, updates: updatedUpdates };
        setActiveProject(newProjectState); 
        
        await dbService.updateProject(newProjectState);
        setUploadQueue(prev => prev.map(item => item.id === pendingItem.id ? { ...item, status: 'completed' } : item));
      } catch (error) {
        setUploadQueue(prev => prev.map(item => item.id === pendingItem.id ? { ...item, status: 'error' } : item));
      }
    };
    if (uploadQueue.some(i => i.status === 'pending')) processQueue();
  }, [uploadQueue, activeProject, activeUpdateIndex, newMediaCategory]);

  const handleLogout = async () => await logoutUser();

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
        
        // Optimistic Update
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
    
    // 1. Create the updated object
    const updatedUpdates = [...activeProject.updates];
    const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
    
    if (field.startsWith('stats.')) {
        const statKey = field.split('.')[1];
        currentUpdate.stats = { ...currentUpdate.stats, [statKey]: value };
    } else { (currentUpdate as any)[field] = value; }
    
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };

    // 2. Optimistic Update (Immediate UI Refresh)
    setActiveProject(updatedProject);

    // 3. Persist to DB
    try { await dbService.updateProject(updatedProject); } catch {}
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
        const { error } = await supabase.auth.updateUser({
            data: { full_name: editName }
        });
        if (error) throw error;
        setUser({...user, name: editName});
        setIsEditingProfile(false);
    } catch (err: any) {
        alert('Failed to update profile: ' + err.message);
    }
  };

  const AppHeader = () => (
    <header className="bg-brand-dark/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 h-16 flex items-center shadow-lg">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xl"><span className="font-display font-bold text-brand-blue text-xl">N</span></div>
                <span className="font-display font-bold text-white text-lg tracking-tight hidden sm:block">Shiko Progresin</span>
            </div>
            <div className="flex items-center gap-3 md:gap-5">
                <InstallButton language={language} />
                <button onClick={() => setCurrentView(AppView.PROFILE)} className={`p-2 rounded-full transition-colors ${currentView === AppView.PROFILE ? 'bg-brand-blue text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </button>
                <button onClick={handleLogout} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-red-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" /></svg>
                </button>
            </div>
        </div>
    </header>
  );

  if (!isOnline) return <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white"><h1>Offline</h1></div>;
  if (!user) return <GlobalAuth onLogin={() => {}} language={language} setLanguage={setLanguage} />;

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-slate-200">
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
            <AppHeader />
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                            {isAdmin ? 'Management' : 'Progress'} <span className="text-brand-blue">Suite</span>
                        </h1>
                        <p className="text-slate-500 mt-2">Active construction projects & site monitoring.</p>
                    </div>
                    {isAdmin && <Button onClick={() => setShowCreateProject(true)}>{text.addNewProject}</Button>}
                </div>
                {loadingProjects ? <div className="animate-pulse flex space-x-4">Loading...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(p => (
                            <div key={p.id} onClick={() => handleProjectSelect(p)} className="group bg-slate-900/40 rounded-3xl overflow-hidden border border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all hover:-translate-y-1">
                                <div className="aspect-video relative overflow-hidden">
                                  <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-white group-hover:text-brand-blue transition-colors">{p.name}</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{p.clientName} • {p.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
      )}

      {currentView === AppView.PROJECT_DETAIL && activeProject && (
         <div className="min-h-screen bg-brand-dark pb-32">
            <AppHeader />
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 relative z-0">
                {/* Project Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <button onClick={() => setCurrentView(AppView.HOME)} className="text-brand-blue hover:text-white transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                           </button>
                           <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{activeProject.name}</h1>
                        </div>
                        <p className="text-slate-500 flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           {activeProject.location}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl backdrop-blur-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Total Progress</span>
                        <div className="flex items-center gap-4">
                           <div className="text-3xl font-bold text-white">{activeProject.updates[activeUpdateIndex].stats.completion}%</div>
                           <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: `${activeProject.updates[activeUpdateIndex].stats.completion}%` }} />
                           </div>
                        </div>
                    </div>
                </div>

                {/* Week Selector */}
                <div className="flex gap-4 overflow-x-auto pb-6 mb-12 no-scrollbar">
                    {isAdmin && <button onClick={handleAddNewWeek} disabled={isAddingWeek} className="min-w-[120px] h-20 border-2 border-dashed border-brand-blue/30 rounded-3xl flex items-center justify-center text-brand-blue hover:bg-brand-blue/5 transition-all text-xl">+</button>}
                    {activeProject.updates.map((u, i) => (
                        <button key={i} onClick={() => setActiveUpdateIndex(i)} className={`min-w-[160px] p-5 rounded-3xl border transition-all text-left group ${i === activeUpdateIndex ? 'border-brand-blue bg-brand-blue/10 shadow-[0_10px_30px_rgba(34,100,171,0.1)]' : 'border-white/5 bg-slate-900/40 hover:bg-slate-900'}`}>
                            <span className="text-[9px] block text-slate-500 font-bold uppercase tracking-widest mb-1">Update {u.weekNumber}</span>
                            <span className={`text-sm font-bold block ${i === activeUpdateIndex ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{u.date}</span>
                        </button>
                    ))}
                </div>

                {/* Hero Experience Suite */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 relative z-10">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex flex-col gap-6">
                           <div className="flex items-center justify-between">
                              <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
                                 <button onClick={() => setHeroTab('3d')} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${heroTab === '3d' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'}`}>3D Site Model</button>
                                 <button onClick={() => setHeroTab('360')} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${heroTab === '360' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'}`}>360 Virtual Tour</button>
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
                        <div className="pt-10 border-t border-white/5">
                           <h2 className="text-xl font-display font-bold text-white mb-8">Site Footage Gallery</h2>
                           <MediaGrid media={activeProject.updates[activeUpdateIndex].media} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8 relative z-20">
                        {/* Site Stats & Summary - Removed sticky behavior to fix overlap issues */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative z-30 shadow-2xl">
                            <h3 className="text-[10px] uppercase font-bold text-brand-blue mb-6 tracking-widest">Executive Update</h3>
                            
                            {isAdmin ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">3D Polycam Embed</label>
                                        <div className="relative">
                                            <input 
                                                className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-brand-blue placeholder-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" 
                                                value={activeProject.updates[activeUpdateIndex].splatUrl || ''} 
                                                onChange={e => handleUpdateField('splatUrl', extractUrlFromEmbed(e.target.value))} 
                                                placeholder="Paste URL or <iframe> code..." 
                                            />
                                            <div className="absolute right-3 top-3 text-slate-600">
                                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-600 mt-1.5 ml-1">Supports direct links or full embed codes.</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">360 Floorfy Embed</label>
                                        <div className="relative">
                                            <input 
                                                className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-brand-blue placeholder-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" 
                                                value={activeProject.updates[activeUpdateIndex].floorfyUrl || ''} 
                                                onChange={e => handleUpdateField('floorfyUrl', extractUrlFromEmbed(e.target.value))} 
                                                placeholder="Paste URL or <iframe> code..." 
                                            />
                                            <div className="absolute right-3 top-3 text-slate-600">
                                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-600 mt-1.5 ml-1">Supports direct links or full embed codes.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Site Completion %</label><input type="number" className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-sm" value={activeProject.updates[activeUpdateIndex].stats.completion} onChange={e => handleUpdateField('stats.completion', parseInt(e.target.value))} /></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Site Workers</label><input type="number" className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-sm" value={activeProject.updates[activeUpdateIndex].stats.workersOnSite} onChange={e => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))} /></div>
                                    </div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Weekly Narrative</label><textarea className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 h-48 resize-none text-sm" value={activeProject.updates[activeUpdateIndex].summary} onChange={e => handleUpdateField('summary', e.target.value)} /></div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                       <h2 className="text-2xl font-bold text-white leading-snug">{activeProject.updates[activeUpdateIndex].title}</h2>
                                       <p className="text-sm text-slate-400 mt-4 leading-relaxed whitespace-pre-line">{activeProject.updates[activeUpdateIndex].summary || 'No summary notes for this week.'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                          <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Weather</span>
                                          <span className="text-white text-xs font-bold">{activeProject.updates[activeUpdateIndex].stats.weatherConditions}</span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                          <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Workforce</span>
                                          <span className="text-white text-xs font-bold">{activeProject.updates[activeUpdateIndex].stats.workersOnSite} Active</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Media Uploader Component */}
                        {isAdmin && (
                           <div className="bg-slate-900/80 border border-brand-blue/20 rounded-3xl p-8">
                               <h4 className="text-[10px] uppercase font-bold text-brand-blue mb-6 tracking-widest">Media Upload Lab</h4>
                               <div className="space-y-6">
                                  <div>
                                     <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Target Area Tag</label>
                                     <select value={newMediaCategory} onChange={(e) => setNewMediaCategory(e.target.value as any)} className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs">
                                        <option value="outside">Outside / Drone</option>
                                        <option value="inside">Inside / Structural</option>
                                        <option value="interior">Interior Finishing</option>
                                        <option value="drone">Drone Mapping</option>
                                        <option value="other">Other</option>
                                     </select>
                                  </div>
                                  <div className="border-2 border-dashed border-white/10 p-8 rounded-2xl text-center group hover:border-brand-blue/50 transition-colors cursor-pointer relative">
                                     <input type="file" multiple accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                        if (e.target.files) {
                                           const files = Array.from(e.target.files).map(f => ({ id: Math.random().toString(), file: f, progress: 0, status: 'pending' as const }));
                                           setUploadQueue(prev => [...prev, ...files]);
                                        }
                                     }} />
                                     <svg className="w-8 h-8 text-slate-500 mx-auto mb-4 group-hover:text-brand-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                     <p className="text-[10px] text-slate-500 font-bold uppercase">Click to add media</p>
                                  </div>
                                  {uploadQueue.filter(q => q.status !== 'completed').length > 0 && (
                                     <div className="animate-pulse flex items-center gap-2 text-[10px] text-brand-blue font-bold uppercase">
                                        <div className="w-2 h-2 rounded-full bg-brand-blue" />
                                        Processing {uploadQueue.filter(q => q.status !== 'completed').length} files...
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
            <AppHeader />
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => setCurrentView(AppView.HOME)} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{text.profileTitle}</h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: User Card */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand-blue/20 to-transparent pointer-events-none" />
                            
                            <div className="relative mb-6 group">
                                <div className="w-32 h-32 rounded-full bg-brand-blue flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-slate-900 overflow-hidden">
                                     {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                     ) : (
                                        <span>{user.name.charAt(0).toUpperCase()}</span>
                                     )}
                                </div>
                                {!user.photoURL && (
                                    <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-2 border border-slate-700 shadow-lg text-slate-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                )}
                            </div>

                            {isEditingProfile ? (
                                <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block text-left">Full Name</label>
                                        <input 
                                            className="w-full bg-slate-950 border border-brand-blue rounded-xl px-4 py-2 text-white text-center focus:outline-none"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-700">Cancel</button>
                                        <button onClick={handleSaveProfile} className="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-blue-600">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                                    <p className="text-slate-400 text-sm mb-6 font-mono">{user.email}</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.isAdmin ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}>
                                            {user.isAdmin ? text.adminRole : text.clientRole}
                                        </span>
                                        <button onClick={() => { setEditName(user.name); setIsEditingProfile(true); }} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Edit Profile">
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

                    {/* Right Column: Settings & Content */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Language Selector */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                {text.languageSettings}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { setLanguage('en'); localStorage.setItem(STORAGE_LANGUAGE_KEY, 'en'); }} className={`relative p-6 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${language === 'en' ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">🇬🇧</div>
                                    <span className={`block text-2xl mb-2 ${language === 'en' ? 'text-white' : 'text-slate-400 grayscale'}`}>🇬🇧</span>
                                    <span className={`font-bold block ${language === 'en' ? 'text-white' : 'text-slate-300'}`}>English</span>
                                    <span className={`text-xs block mt-1 ${language === 'en' ? 'text-blue-200' : 'text-slate-500'}`}>International</span>
                                </button>
                                <button onClick={() => { setLanguage('sq'); localStorage.setItem(STORAGE_LANGUAGE_KEY, 'sq'); }} className={`relative p-6 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${language === 'sq' ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">🇦🇱</div>
                                    <span className={`block text-2xl mb-2 ${language === 'sq' ? 'text-white' : 'text-slate-400 grayscale'}`}>🇦🇱</span>
                                    <span className={`font-bold block ${language === 'sq' ? 'text-white' : 'text-slate-300'}`}>Shqip</span>
                                    <span className={`text-xs block mt-1 ${language === 'sq' ? 'text-blue-200' : 'text-slate-500'}`}>Amtare</span>
                                </button>
                            </div>
                        </div>

                        {/* Accessed Projects List */}
                        {!user.isAdmin && (
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    {text.myUnlockedProjects}
                                </h3>
                                
                                {projects.filter(p => unlockedProjectIds.includes(p.id)).length > 0 ? (
                                    <div className="grid gap-4">
                                        {projects.filter(p => unlockedProjectIds.includes(p.id)).map(p => (
                                            <div key={p.id} onClick={() => handleProjectSelect(p)} className="group flex items-center gap-5 p-4 rounded-2xl bg-slate-950 border border-white/5 cursor-pointer hover:border-brand-blue/50 hover:bg-slate-900 transition-all active:scale-[0.99]">
                                                <div className="w-20 h-16 rounded-xl overflow-hidden shadow-lg relative">
                                                    <img src={p.thumbnailUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-base group-hover:text-brand-blue transition-colors">{p.name}</h4>
                                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">{p.location}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 px-6 rounded-2xl bg-slate-950/50 border border-dashed border-white/10">
                                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">{text.noProjectsAccess}</p>
                                        <Button variant="primary" onClick={() => setCurrentView(AppView.HOME)} className="!py-2 !px-6 !text-xs">
                                            {text.browseProjects}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex justify-center mt-8">
                             <a href="mailto:support@ndertimi.org" className="text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors">
                                 Support ID: {user.uid.substring(0, 8)} • v1.0.4
                             </a>
                        </div>
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
