
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
  
  const isAdmin = user?.isAdmin || false;
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAddingWeek, setIsAddingWeek] = useState(false);

  // Admin Edit State
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video' | '360'>('photo');
  const [newMediaDesc, setNewMediaDesc] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<'inside' | 'outside' | 'drone' | 'interior' | 'other'>('outside');
  
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (updated && JSON.stringify(updated) !== JSON.stringify(activeProjectRef.current)) {
                setActiveProject(updated);
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
            thumbnail: type === 'video' ? undefined : downloadUrl,
            category: newMediaCategory
        };

        const updatedUpdates = [...activeProject.updates];
        updatedUpdates[activeUpdateIndex] = {
            ...updatedUpdates[activeUpdateIndex],
            media: [newItem, ...updatedUpdates[activeUpdateIndex].media]
        };
        const updatedProject = { ...activeProject, updates: updatedUpdates };
        await dbService.updateProject(updatedProject);
        
        setUploadQueue(prev => prev.map(item => 
            item.id === pendingItem.id ? { ...item, progress: 100, status: 'completed' } : item
        ));
      } catch (error) {
        setUploadQueue(prev => prev.map(item => 
            item.id === pendingItem.id ? { ...item, status: 'error' } : item
        ));
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
    const newId = `p_${Date.now()}`;
    const newProject: Project = {
        id: newId,
        ...newProjectForm,
        thumbnailUrl: newProjectForm.thumbnailUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000',
        updates: [{
            weekNumber: 1,
            date: new Date().toISOString().split('T')[0],
            title: 'Project Initialization',
            summary: 'Initial project setup.',
            media: [],
            stats: { completion: 0, workersOnSite: 0, weatherConditions: 'N/A' }
        }]
    };
    try {
        await dbService.addProject(newProject);
        setShowCreateProject(false);
        setNewProjectForm({ name: '', clientName: '', location: '', accessCode: '', description: '', thumbnailUrl: '' });
    } catch (err: any) {
        alert(`Failed to create project: ${err.message}`);
    } finally { setIsCreatingProject(false); }
  };

  const handleAddNewWeek = async () => {
    if (!activeProject) return;
    setIsAddingWeek(true);
    try {
        const latestWeek = activeProject.updates.length > 0 ? Math.max(...activeProject.updates.map(u => u.weekNumber)) : 0;
        const newUpdate: WeeklyUpdate = {
            weekNumber: latestWeek + 1,
            date: new Date().toISOString().split('T')[0],
            title: `Week ${latestWeek + 1} Update`,
            summary: 'Weekly summary notes...',
            media: [],
            stats: { completion: activeProject.updates[0]?.stats.completion || 0, workersOnSite: 0, weatherConditions: 'Sunny' },
            splatUrl: ''
        };
        const updatedProject = { ...activeProject, updates: [newUpdate, ...activeProject.updates] };
        await dbService.updateProject(updatedProject);
        setActiveUpdateIndex(0);
    } catch (err: any) { alert(`Failed: ${err.message}`); }
    finally { setIsAddingWeek(false); }
  };

  const handleUpdateField = async (field: string, value: string | number) => {
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

  const handleManualAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newMediaUrl) return;
    const newItem: MediaItem = {
        id: Date.now().toString(),
        type: newMediaType,
        url: newMediaUrl,
        description: newMediaDesc || 'Linked Media',
        category: newMediaCategory
    };
    const updatedUpdates = [...activeProject.updates];
    updatedUpdates[activeUpdateIndex].media = [newItem, ...updatedUpdates[activeUpdateIndex].media];
    await dbService.updateProject({ ...activeProject, updates: updatedUpdates });
    setNewMediaUrl('');
    setNewMediaDesc('');
  };

  const AppHeader = () => (
    <header className="bg-brand-dark/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}>
                 <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-lg"><span className="font-display font-bold text-brand-blue text-lg">N</span></div>
                <span className="font-display font-bold text-white text-lg tracking-tight">Shiko Progresin</span>
            </div>
            <div className="flex items-center gap-4">
                <InstallButton language={language} />
                <button onClick={() => setCurrentView(AppView.PROFILE)} className={`text-xs font-bold uppercase ${currentView === AppView.PROFILE ? 'text-brand-blue' : 'text-slate-500 hover:text-white'}`}>{text.profile}</button>
                <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
            </div>
        </div>
    </header>
  );

  if (!isOnline) return <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center text-white"><h1>No Internet</h1></div>;
  if (!user) return <GlobalAuth onLogin={() => {}} language={language} setLanguage={setLanguage} />;

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-slate-200">
      {pendingProject && <LoginScreen targetProject={pendingProject} onLogin={handleAuthenticationSuccess} onCancel={() => setPendingProject(null)} />}
      
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
             <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-2xl shadow-2xl my-8">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Name</label><input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white" value={newProjectForm.name} onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Client</label><input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white" value={newProjectForm.clientName} onChange={e => setNewProjectForm({...newProjectForm, clientName: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Location</label><input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white" value={newProjectForm.location} onChange={e => setNewProjectForm({...newProjectForm, location: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Access Code</label><input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white" value={newProjectForm.accessCode} onChange={e => setNewProjectForm({...newProjectForm, accessCode: e.target.value})} /></div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isCreatingProject}>Create</Button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {currentView === AppView.HOME && (
        <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        {isAdmin ? 'Admin' : 'Client'} <span className="text-brand-blue">Dashboard</span>
                    </h1>
                    {isAdmin && <Button onClick={() => setShowCreateProject(true)}>{text.addNewProject}</Button>}
                </div>
                {loadingProjects ? <div>Loading...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(p => (
                            <div key={p.id} onClick={() => handleProjectSelect(p)} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 cursor-pointer hover:border-brand-blue/50 transition-all">
                                <img src={p.thumbnailUrl} className="aspect-video w-full object-cover" />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                                    <p className="text-slate-400 text-sm mt-2">{p.clientName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
      )}

      {currentView === AppView.PROFILE && <div className="min-h-screen flex flex-col"><AppHeader /></div>}

      {currentView === AppView.PROJECT_DETAIL && activeProject && (
         <div className="min-h-screen bg-brand-dark pb-20">
            <AppHeader />
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white">{activeProject.name}</h1>
                        <p className="text-slate-500">{activeProject.location}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right"><span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span><span className="text-xl font-bold text-brand-blue">{activeProject.updates[activeUpdateIndex].stats.completion}%</span></div>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar">
                    {isAdmin && <button onClick={handleAddNewWeek} disabled={isAddingWeek} className="min-w-[100px] h-16 border border-dashed border-brand-blue rounded-xl flex items-center justify-center text-brand-blue hover:bg-brand-blue/10">+</button>}
                    {activeProject.updates.map((u, i) => (
                        <button key={i} onClick={() => setActiveUpdateIndex(i)} className={`min-w-[120px] p-4 rounded-xl border transition-all ${i === activeUpdateIndex ? 'border-brand-blue bg-brand-blue/10' : 'border-slate-800 bg-slate-900'}`}>
                            <span className="text-xs block text-slate-500">Week {u.weekNumber}</span>
                            <span className="text-sm font-bold text-white">{u.date}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {isAdmin && (
                            <div className="bg-slate-900 border border-brand-blue/30 rounded-2xl p-6 space-y-6">
                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Default Area Tag for Uploads</label>
                                        <select 
                                            value={newMediaCategory}
                                            onChange={(e) => setNewMediaCategory(e.target.value as any)}
                                            className="w-full bg-brand-dark border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        >
                                            <option value="outside">Outside / Exterior</option>
                                            <option value="inside">Inside / Interior</option>
                                            <option value="drone">Drone Footage</option>
                                            <option value="interior">Interior Finishing</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 p-4 border border-slate-800 rounded-xl bg-black/20">
                                        <input 
                                            type="file" multiple accept="image/*,video/*"
                                            className="text-xs text-slate-500"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const files = Array.from(e.target.files).map(f => ({
                                                        id: Math.random().toString(),
                                                        file: f,
                                                        progress: 0,
                                                        status: 'pending' as const
                                                    }));
                                                    setUploadQueue(prev => [...prev, ...files]);
                                                }
                                            }}
                                        />
                                        {uploadQueue.length > 0 && <span className="text-xs text-brand-blue font-bold">Uploading {uploadQueue.filter(q => q.status !== 'completed').length} files...</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-[500px]">
                            <SplatViewer url={activeProject.updates[activeUpdateIndex].splatUrl} title={`Week ${activeProject.updates[activeUpdateIndex].weekNumber}`} />
                        </div>
                        <MediaGrid media={activeProject.updates[activeUpdateIndex].media} />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
                            <h3 className="text-xs uppercase font-bold text-slate-500 mb-4 tracking-widest">Update Overview</h3>
                            {isAdmin ? (
                                <div className="space-y-4">
                                    <input className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-2" value={activeProject.updates[activeUpdateIndex].title} onChange={e => handleUpdateField('title', e.target.value)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] text-slate-500 uppercase block mb-1">Workers</label><input type="number" className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-2" value={activeProject.updates[activeUpdateIndex].stats.workersOnSite} onChange={e => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))} /></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase block mb-1">Completion</label><input type="number" className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-2" value={activeProject.updates[activeUpdateIndex].stats.completion} onChange={e => handleUpdateField('stats.completion', parseInt(e.target.value))} /></div>
                                    </div>
                                    <textarea className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-2 h-32 resize-none" value={activeProject.updates[activeUpdateIndex].summary} onChange={e => handleUpdateField('summary', e.target.value)} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-white">{activeProject.updates[activeUpdateIndex].title}</h2>
                                    <p className="text-sm text-slate-400 leading-relaxed">{activeProject.updates[activeUpdateIndex].summary}</p>
                                    <div className="pt-4 border-t border-slate-800 flex justify-between">
                                        <div className="text-center"><span className="text-[10px] text-slate-600 block">WEATHER</span><span className="text-white text-xs">{activeProject.updates[activeUpdateIndex].stats.weatherConditions}</span></div>
                                        <div className="text-center"><span className="text-[10px] text-slate-600 block">SITE WORKERS</span><span className="text-white text-xs">{activeProject.updates[activeUpdateIndex].stats.workersOnSite}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
      )}
    </div>
  );
};

export default App;
