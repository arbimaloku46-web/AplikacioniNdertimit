
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

  const [newProjectForm, setNewProjectForm] = useState({
    name: '', clientName: '', location: '', accessCode: '', description: '', thumbnailUrl: ''
  });

  const activeProjectRef = useRef<Project | null>(null);
  useEffect(() => { activeProjectRef.current = activeProject; }, [activeProject]);

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
        if (activeProjectRef.current) {
            const updated = data.find(p => p.id === activeProjectRef.current?.id);
            if (updated) setActiveProject(updated);
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
        await dbService.updateProject({ ...activeProject, updates: updatedUpdates });
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
        await dbService.updateProject(updatedProject);
        setActiveUpdateIndex(0);
    } catch (err: any) { alert(err.message); }
    finally { setIsAddingWeek(false); }
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
    try { await dbService.updateProject({ ...activeProject, updates: updatedUpdates }); } catch {}
  };

  const AppHeader = () => (
    <header className="bg-brand-dark/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xl"><span className="font-display font-bold text-brand-blue text-xl">N</span></div>
                <span className="font-display font-bold text-white text-lg tracking-tight hidden sm:block">Shiko Progresin</span>
            </div>
            <div className="flex items-center gap-3 md:gap-5">
                <InstallButton language={language} />
                <button onClick={() => setCurrentView(AppView.PROFILE)} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
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
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
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

                    <div className="lg:col-span-4 space-y-8">
                        {/* Site Stats & Summary */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl sticky top-24">
                            <h3 className="text-[10px] uppercase font-bold text-brand-blue mb-6 tracking-widest">Executive Update</h3>
                            
                            {isAdmin ? (
                                <div className="space-y-6">
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">3D Polycam Embed URL</label><input className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs" value={activeProject.updates[activeUpdateIndex].splatUrl || ''} onChange={e => handleUpdateField('splatUrl', e.target.value)} placeholder="https://poly.cam/..." /></div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">360 Floorfy Embed URL</label><input className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-xs" value={activeProject.updates[activeUpdateIndex].floorfyUrl || ''} onChange={e => handleUpdateField('floorfyUrl', e.target.value)} placeholder="https://floorfy.com/..." /></div>
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
    </div>
  );
};

export default App;
