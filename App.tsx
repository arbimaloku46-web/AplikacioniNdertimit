
import React, { useState, useEffect } from 'react';
import { MOCK_PROJECTS } from './constants';
import { Project, MediaItem, AppView, WeeklyUpdate } from './types';
import { LoginScreen } from './components/LoginScreen';
import { GlobalAuth } from './components/GlobalAuth';
import { Button } from './components/Button';
import { SplatViewer } from './components/SplatViewer';
import { AIInsight } from './components/AIInsight';
import { MediaGrid } from './components/MediaGrid';
import { Footer } from './components/Footer';
import { Language, translations } from './translations';

// Changed key to v3 to force a data reset
const STORAGE_PROJECTS_KEY = 'ndertimi_projects_data_v3';
const STORAGE_UNLOCKED_KEY = 'ndertimi_unlocked_projects';
const STORAGE_SESSION_KEY = 'ndertimi_session_user_v2';
const STORAGE_SESSION_IS_ADMIN = 'ndertimi_session_is_admin_v2';
const STORAGE_LANGUAGE_KEY = 'ndertimi_language_pref';

const App: React.FC = () => {
  // --- STATE ---
  
  // Auth & User
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<string[]>([]);

  // Settings
  const [language, setLanguage] = useState<Language>('en');

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Navigation & View
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);
  const [activeUpdateIndex, setActiveUpdateIndex] = useState<number>(0);
  
  // Admin Mode
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Admin Edit State (Content)
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video' | '360'>('photo');
  const [newMediaDesc, setNewMediaDesc] = useState('');

  // Admin Create Project State
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    clientName: '',
    location: '',
    accessCode: '',
    description: '',
    thumbnailUrl: ''
  });

  // Translation Helper
  const text = translations[language];

  // --- INITIALIZATION ---

  useEffect(() => {
    // Load Projects from Storage or Seed
    const storedProjects = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      setProjects(MOCK_PROJECTS);
    }

    // Load User's Unlocked Projects
    const storedUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    if (storedUnlocked) {
      setUnlockedProjectIds(JSON.parse(storedUnlocked));
    }

    // Load Language Preference
    const storedLang = localStorage.getItem(STORAGE_LANGUAGE_KEY);
    if (storedLang === 'en' || storedLang === 'sq') {
        setLanguage(storedLang as Language);
    }

    // Check for saved session
    const savedSessionUser = localStorage.getItem(STORAGE_SESSION_KEY);
    const savedSessionAdmin = localStorage.getItem(STORAGE_SESSION_IS_ADMIN);
    
    if (savedSessionUser) {
        setUserName(savedSessionUser);
        setIsLoggedIn(true);
        if (savedSessionAdmin === 'true') {
            setIsAdmin(true);
        }
    }

    setIsDataLoaded(true);
  }, []);

  // Save projects whenever they change, but only after initial load
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    }
  }, [projects, isDataLoaded]);

  // Save language preference
  useEffect(() => {
      localStorage.setItem(STORAGE_LANGUAGE_KEY, language);
  }, [language]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, activeProject, isLoggedIn]);

  // --- HANDLERS ---

  const handleGlobalLogin = (name: string, remember: boolean, adminAccess: boolean) => {
    setUserName(name);
    setIsLoggedIn(true);
    setIsAdmin(adminAccess);
    
    if (remember) {
        localStorage.setItem(STORAGE_SESSION_KEY, name);
        if (adminAccess) {
            localStorage.setItem(STORAGE_SESSION_IS_ADMIN, 'true');
        }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');
    setCurrentView(AppView.HOME);
    setActiveProject(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_SESSION_IS_ADMIN);
  };

  const handleProjectSelect = (project: Project) => {
    // If admin, bypass code
    if (isAdmin) {
        setActiveProject(project);
        setActiveUpdateIndex(0);
        setCurrentView(AppView.PROJECT_DETAIL);
        return;
    }

    // If already unlocked, bypass code
    if (unlockedProjectIds.includes(project.id)) {
        setActiveProject(project);
        setActiveUpdateIndex(0);
        setCurrentView(AppView.PROJECT_DETAIL);
    } else {
        setPendingProject(project);
    }
  };

  const handleAuthenticationSuccess = () => {
    if (pendingProject) {
      // Add to unlocked list
      const newUnlocked = [...unlockedProjectIds, pendingProject.id];
      setUnlockedProjectIds(newUnlocked);
      localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(newUnlocked));

      setActiveProject(pendingProject);
      setActiveUpdateIndex(0);
      setPendingProject(null);
      setCurrentView(AppView.PROJECT_DETAIL);
    }
  };

  // --- ADMIN LOGIC ---

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this project?')) {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        // If active, clear
        if (activeProject?.id === projectId) {
            setActiveProject(null);
            setCurrentView(AppView.HOME);
        }
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `p_${Date.now()}`;
    const emptyUpdate: WeeklyUpdate = {
        weekNumber: 1,
        date: new Date().toISOString().split('T')[0],
        title: 'Project Initialization',
        summary: 'Project setup complete. Initial site surveys scheduled.',
        media: [],
        stats: { completion: 0, workersOnSite: 0, weatherConditions: 'N/A' }
    };

    const newProject: Project = {
        id: newId,
        ...newProjectForm,
        thumbnailUrl: newProjectForm.thumbnailUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000',
        updates: [emptyUpdate]
    };

    setProjects([newProject, ...projects]);
    setShowCreateProject(false);
    setNewProjectForm({ name: '', clientName: '', location: '', accessCode: '', description: '', thumbnailUrl: '' });
  };

  const handleAddNewWeek = () => {
    if (!activeProject) return;

    // Determine next week number
    const latestWeek = activeProject.updates.length > 0 
        ? Math.max(...activeProject.updates.map(u => u.weekNumber)) 
        : 0;
    
    const nextWeek = latestWeek + 1;
    const today = new Date().toISOString().split('T')[0];

    // Create new update, carrying over completion stats for convenience
    const newUpdate: WeeklyUpdate = {
        weekNumber: nextWeek,
        date: today,
        title: `Week ${nextWeek} Update`,
        summary: 'Enter weekly summary here...',
        media: [],
        stats: {
            completion: activeProject.updates[0]?.stats.completion || 0,
            workersOnSite: 0,
            weatherConditions: 'Sunny'
        },
        splatUrl: ''
    };

    const updatedProjects = projects.map(p => {
        if (p.id === activeProject.id) {
            // Add to beginning of array
            return { ...p, updates: [newUpdate, ...p.updates] };
        }
        return p;
    });

    setProjects(updatedProjects);
    setActiveProject(updatedProjects.find(p => p.id === activeProject.id) || null);
    setActiveUpdateIndex(0); // Switch view to new week
  };

  const handleUpdateField = (field: string, value: string | number) => {
    if (!activeProject) return;
    
    // Deep copy projects
    const updatedProjects = projects.map(p => {
        if (p.id === activeProject.id) {
            const updatedUpdates = [...p.updates];
            const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
            
            if (field.startsWith('stats.')) {
                const statKey = field.split('.')[1];
                currentUpdate.stats = { ...currentUpdate.stats, [statKey]: value };
            } else {
                (currentUpdate as any)[field] = value;
            }
            
            updatedUpdates[activeUpdateIndex] = currentUpdate;
            return { ...p, updates: updatedUpdates };
        }
        return p;
    });

    setProjects(updatedProjects);
    // Update active project reference so UI updates immediately
    setActiveProject(updatedProjects.find(p => p.id === activeProject.id) || null);
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newMediaUrl) return;

    const newItem: MediaItem = {
        id: Date.now().toString(),
        type: newMediaType,
        url: newMediaUrl,
        description: newMediaDesc || 'New Upload',
        thumbnail: newMediaType === 'video' ? newMediaUrl : undefined 
    };

    const updatedProjects = projects.map(p => {
        if (p.id === activeProject.id) {
            const updatedUpdates = [...p.updates];
            updatedUpdates[activeUpdateIndex] = {
                ...updatedUpdates[activeUpdateIndex],
                media: [newItem, ...updatedUpdates[activeUpdateIndex].media]
            };
            return { ...p, updates: updatedUpdates };
        }
        return p;
    });

    setProjects(updatedProjects);
    setActiveProject(updatedProjects.find(p => p.id === activeProject.id) || null);
    setNewMediaUrl('');
    setNewMediaDesc('');
  };


  // --- SUB-COMPONENTS ---

  const AppHeader = () => (
    <header className="bg-brand-dark/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                setActiveProject(null);
                setCurrentView(AppView.HOME);
            }}>
                 <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-lg">
                    <span className="font-display font-bold text-brand-blue text-lg">N</span>
                </div>
                <span className="font-display font-bold text-white text-lg tracking-tight">Shiko Progresin <span className="text-slate-500 font-normal text-sm ml-2 hidden sm:inline">{isAdmin ? text.adminPortal : text.clientPortal}</span></span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                <button 
                    onClick={() => setCurrentView(AppView.PROFILE)}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${currentView === AppView.PROFILE ? 'text-brand-blue' : 'text-slate-500 hover:text-white'}`}
                >
                     <span className="md:hidden">{text.profile}</span>
                     <span className="hidden md:inline">{text.profile}</span>
                </button>
                
                {isAdmin && (
                    <div className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-brand-blue text-white border border-brand-blue">
                        {text.adminActive}
                    </div>
                )}
                
                <div className="h-6 w-[1px] bg-slate-800"></div>
                
                <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
                    <span className="hidden md:inline">{text.logout}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>
    </header>
  );

  // --- MAIN VIEW LOGIC ---

  if (!isLoggedIn) {
    return <GlobalAuth onLogin={handleGlobalLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-slate-200 selection:bg-brand-blue/30 selection:text-brand-blue">
      
      {/* MODAL: Login Code */}
      {pendingProject && (
        <LoginScreen 
          targetProject={pendingProject} 
          onLogin={handleAuthenticationSuccess}
          onCancel={() => setPendingProject(null)}
        />
      )}

      {/* MODAL: Create Project */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
             <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-2xl shadow-2xl my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                    <button onClick={() => setShowCreateProject(false)} className="text-slate-500 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Name</label>
                        <input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white focus:border-brand-blue outline-none" 
                            value={newProjectForm.name} onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client Name</label>
                        <input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white focus:border-brand-blue outline-none" 
                            value={newProjectForm.clientName} onChange={e => setNewProjectForm({...newProjectForm, clientName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                        <input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white focus:border-brand-blue outline-none" 
                            value={newProjectForm.location} onChange={e => setNewProjectForm({...newProjectForm, location: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Access Code</label>
                        <input required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white focus:border-brand-blue outline-none font-mono tracking-widest" 
                            placeholder="e.g. 1234"
                            value={newProjectForm.accessCode} onChange={e => setNewProjectForm({...newProjectForm, accessCode: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Thumbnail URL</label>
                        <input className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white focus:border-brand-blue outline-none" 
                             placeholder="https://..."
                            value={newProjectForm.thumbnailUrl} onChange={e => setNewProjectForm({...newProjectForm, thumbnailUrl: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                        <textarea required className="w-full bg-brand-dark border border-slate-700 rounded px-4 py-3 text-white focus:border-brand-blue outline-none h-24 resize-none" 
                            value={newProjectForm.description} onChange={e => setNewProjectForm({...newProjectForm, description: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)}>Cancel</Button>
                        <Button type="submit">Create Project</Button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* --- APP VIEWS --- */}

      {currentView === AppView.HOME && (
        <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        {isAdmin ? text.admin : text.client} <span className="text-brand-blue">{text.dashboardTitle}</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        {isAdmin 
                         ? text.dashboardSubtitleAdmin
                         : text.dashboardSubtitleClient}
                    </p>
                    
                    {isAdmin && (
                        <div className="mt-8">
                            <Button onClick={() => setShowCreateProject(true)}>{text.addNewProject}</Button>
                        </div>
                    )}
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{text.noProjectsTitle}</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {isAdmin 
                                ? text.noProjectsDescAdmin 
                                : text.noProjectsDescClient
                            }
                        </p>
                        {isAdmin && (
                             <Button onClick={() => setShowCreateProject(true)} className="mt-6">{text.createFirstProject}</Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <div 
                                key={project.id}
                                onClick={() => handleProjectSelect(project)}
                                className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 cursor-pointer hover:border-brand-blue/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                            >
                                {/* Delete Button (Admin Only) */}
                                {isAdmin && (
                                    <button 
                                        onClick={(e) => handleDeleteProject(e, project.id)}
                                        className="absolute top-4 left-4 bg-red-500/90 hover:bg-red-600 backdrop-blur-md p-2 rounded-full text-white border border-red-400/20 transition-colors z-20 opacity-0 group-hover:opacity-100"
                                        title="Delete Project"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}

                                <div className="relative aspect-video overflow-hidden">
                                    <img 
                                        src={project.thumbnailUrl} 
                                        alt={project.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                                    {unlockedProjectIds.includes(project.id) || isAdmin ? (
                                         <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full text-black text-xs font-bold border border-green-400/20 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            {text.unlocked}
                                        </div>
                                    ) : (
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-white border border-white/10">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-display font-bold text-white group-hover:text-brand-blue transition-colors">{project.name}</h3>
                                        {project.updates.length > 0 && (
                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">{text.week} {project.updates[0].weekNumber}</span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                    <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{project.clientName}</span>
                                        </div>
                                        <span className="text-brand-blue text-sm font-medium group-hover:translate-x-1 transition-transform">
                                            {unlockedProjectIds.includes(project.id) || isAdmin ? text.enterPortal + ' →' : text.requestAccess + ' →'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
             <Footer />
        </div>
      )}

      {currentView === AppView.PROFILE && (
        <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                            {userName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white">{userName}</h2>
                            <p className="text-slate-400">{isAdmin ? text.adminRole : text.clientRole}</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={handleLogout}>{text.signOut}</Button>
                </div>
                
                {/* Language Settings */}
                <div className="mb-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">{text.languageSettings}</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <span className="text-slate-400 text-sm">{text.selectLanguage}:</span>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-2 rounded-lg border transition-all font-medium ${language === 'en' ? 'bg-brand-blue border-brand-blue text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                🇺🇸 {text.english}
                            </button>
                            <button 
                                onClick={() => setLanguage('sq')}
                                className={`px-4 py-2 rounded-lg border transition-all font-medium ${language === 'sq' ? 'bg-brand-blue border-brand-blue text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                🇦🇱 {text.albanian}
                            </button>
                        </div>
                    </div>
                </div>

                {!isAdmin && (
                    <>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {text.myUnlockedProjects}
                    </h3>

                    {unlockedProjectIds.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                            <p className="text-slate-500">{text.noProjectsAccess}</p>
                            <Button className="mt-4" variant="outline" onClick={() => setCurrentView(AppView.HOME)}>{text.browseProjects}</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.filter(p => unlockedProjectIds.includes(p.id)).map(project => (
                                <div 
                                    key={project.id}
                                    onClick={() => handleProjectSelect(project)}
                                    className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-brand-blue/50 transition-all"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 right-2 bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded">{text.accessGranted}</div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="text-lg font-bold text-white">{project.name}</h4>
                                        <p className="text-slate-400 text-sm">{project.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                )}
            </main>
        </div>
      )}

      {currentView === AppView.PROJECT_DETAIL && activeProject && (
         <div className="min-h-screen bg-brand-dark">
            <AppHeader />
            
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                
                {/* Project Title Bar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/5">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{activeProject.name}</h1>
                        <p className="text-slate-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {activeProject.location}
                        </p>
                    </div>
                    <div className="flex gap-8">
                         <div className="text-right">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Completion</span>
                            <span className="text-2xl font-display font-bold text-brand-blue">{activeProject.updates[activeUpdateIndex].stats.completion}%</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">{text.week}</span>
                            <span className="text-2xl font-display font-bold text-white">#{activeProject.updates[activeUpdateIndex].weekNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Selector */}
                <div className="mb-8">
                     <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {isAdmin && (
                            <button 
                                onClick={handleAddNewWeek}
                                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] h-[72px] p-2 rounded-xl border border-dashed border-brand-blue/50 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue transition-all"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-bold leading-none mb-1">+</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Add Week</span>
                                </div>
                            </button>
                        )}
                        {activeProject.updates.map((update, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveUpdateIndex(index)}
                                className={`flex-shrink-0 flex flex-col min-w-[120px] p-4 rounded-xl border transition-all ${
                                    index === activeUpdateIndex
                                    ? 'bg-brand-blue/10 border-brand-blue'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                                    index === activeUpdateIndex ? 'text-brand-blue' : 'text-slate-500'
                                }`}>{text.week} {update.weekNumber}</span>
                                <span className={`text-sm font-medium ${
                                    index === activeUpdateIndex ? 'text-white' : 'text-slate-400'
                                }`}>{update.date}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content: Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Admin Edit Panel */}
                        {isAdmin && (
                            <div className="bg-slate-900 border border-brand-blue/50 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-brand-blue font-bold text-sm uppercase flex items-center gap-2">
                                        <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></span>
                                        Editor Mode
                                    </h3>
                                </div>
                                
                                <div className="grid gap-6">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1 uppercase font-bold">Gaussian Splat URL (Polycam)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-1 bg-brand-dark border border-slate-700 rounded px-4 py-2 text-white text-sm focus:border-brand-blue outline-none transition-colors"
                                                value={activeProject.updates[activeUpdateIndex].splatUrl || ''} 
                                                onChange={(e) => handleUpdateField('splatUrl', e.target.value)}
                                                placeholder="https://poly.cam/..."
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">Paste the standard 'Share' URL from Polycam.</p>
                                    </div>

                                    <div className="border-t border-slate-800 pt-4">
                                         <label className="text-xs text-slate-400 block mb-2 uppercase font-bold">Add New Media</label>
                                         <form onSubmit={handleAddMedia} className="space-y-3">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <select 
                                                    value={newMediaType}
                                                    onChange={(e) => setNewMediaType(e.target.value as any)}
                                                    className="bg-brand-dark border border-slate-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
                                                >
                                                    <option value="photo">Photo</option>
                                                    <option value="video">Video</option>
                                                    <option value="360">360°</option>
                                                </select>
                                                <input 
                                                    className="flex-1 bg-brand-dark border border-slate-700 rounded px-4 py-2 text-white text-sm focus:border-brand-blue outline-none"
                                                    placeholder="Media URL..."
                                                    value={newMediaUrl}
                                                    onChange={(e) => setNewMediaUrl(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <input 
                                                    className="flex-1 bg-brand-dark border border-slate-700 rounded px-4 py-2 text-white text-sm focus:border-brand-blue outline-none"
                                                    placeholder="Description..."
                                                    value={newMediaDesc}
                                                    onChange={(e) => setNewMediaDesc(e.target.value)}
                                                />
                                                <Button type="submit" className="!py-2">Add Media</Button>
                                            </div>
                                         </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Splat Viewer */}
                        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-[500px]">
                            <SplatViewer url={activeProject.updates[activeUpdateIndex].splatUrl} title={`Week ${activeProject.updates[activeUpdateIndex].weekNumber}`} />
                        </div>

                        {/* Media Grid */}
                        <div>
                            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Site Footage
                            </h3>
                            <MediaGrid media={activeProject.updates[activeUpdateIndex].media} />
                        </div>
                    </div>

                    {/* Info Sidebar: Right Column */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                            <div className="mb-6">
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Update Title</h2>
                                {isAdmin ? (
                                    <input 
                                        value={activeProject.updates[activeUpdateIndex].title}
                                        onChange={(e) => handleUpdateField('title', e.target.value)}
                                        className="w-full bg-brand-dark border border-slate-700 rounded px-3 py-2 text-white text-lg font-display font-bold focus:border-brand-blue outline-none"
                                    />
                                ) : (
                                    <h3 className="text-xl font-display font-bold text-white">{activeProject.updates[activeUpdateIndex].title}</h3>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Workers on Site</span>
                                    {isAdmin ? (
                                        <input 
                                            type="number"
                                            value={activeProject.updates[activeUpdateIndex].stats.workersOnSite}
                                            onChange={(e) => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))}
                                            className="w-20 bg-brand-dark border border-slate-700 rounded px-2 py-1 text-white text-right font-mono"
                                        />
                                    ) : (
                                        <span className="text-white font-mono font-medium">{activeProject.updates[activeUpdateIndex].stats.workersOnSite}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Weather</span>
                                    {isAdmin ? (
                                        <input 
                                            value={activeProject.updates[activeUpdateIndex].stats.weatherConditions}
                                            onChange={(e) => handleUpdateField('stats.weatherConditions', e.target.value)}
                                            className="w-32 bg-brand-dark border border-slate-700 rounded px-2 py-1 text-white text-right font-mono text-xs"
                                        />
                                    ) : (
                                        <span className="text-white font-mono font-medium">{activeProject.updates[activeUpdateIndex].stats.weatherConditions}</span>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                        <span className="text-slate-400 text-sm">Completion %</span>
                                        <input 
                                            type="number"
                                            value={activeProject.updates[activeUpdateIndex].stats.completion}
                                            onChange={(e) => handleUpdateField('stats.completion', parseInt(e.target.value))}
                                            className="w-20 bg-brand-dark border border-slate-700 rounded px-2 py-1 text-white text-right font-mono"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Summary</h4>
                                <AIInsight project={activeProject} update={activeProject.updates[activeUpdateIndex]} />
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Notes</h4>
                                {isAdmin ? (
                                    <textarea 
                                        value={activeProject.updates[activeUpdateIndex].summary}
                                        onChange={(e) => handleUpdateField('summary', e.target.value)}
                                        className="w-full h-32 bg-brand-dark border border-slate-700 rounded p-3 text-sm text-slate-300 focus:border-brand-blue outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-slate-400 text-sm leading-relaxed">{activeProject.updates[activeUpdateIndex].summary}</p>
                                )}
                            </div>
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
