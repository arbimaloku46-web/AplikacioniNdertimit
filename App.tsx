
import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { MOCK_PROJECTS, COUNTRIES } from './constants';
import { Project, MediaItem, AppView, WeeklyUpdate } from './types';
import { LoginScreen } from './components/LoginScreen';
import { GlobalAuth } from './components/GlobalAuth';
import { Button } from './components/Button';
import { SplatViewer } from './components/SplatViewer';
import { AIInsight } from './components/AIInsight';
import { MediaGrid } from './components/MediaGrid';
import { Footer } from './components/Footer';
import { Language, translations } from './translations';
import { dbService } from './services/db';

const STORAGE_UNLOCKED_KEY = 'ndertimi_unlocked_projects';
const STORAGE_SESSION_KEY = 'ndertimi_session_user_v2';
const STORAGE_SESSION_COUNTRY = 'ndertimi_session_country_v2';
const STORAGE_SESSION_IS_ADMIN = 'ndertimi_session_is_admin_v2';
const STORAGE_LANGUAGE_KEY = 'ndertimi_language_pref';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const App: React.FC = () => {
  // --- STATE ---
  
  // Auth & User
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('AL');
  const [unlockedProjectIds, setUnlockedProjectIds] = useState<string[]>([]);

  // Network
  const [isOnline, setIsOnline] = useState<boolean>(true);

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
  
  // Admin Bulk Upload State
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Create Project State
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    clientName: '',
    location: '',
    accessCode: '',
    description: '',
    thumbnailUrl: ''
  });

  // Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Translation Helper
  const text = translations[language];

  // --- INITIALIZATION ---

  useEffect(() => {
    // Network Listener
    const checkNetwork = async () => {
       const status = await Network.getStatus();
       setIsOnline(status.connected);
    };
    
    checkNetwork();
    
    const networkListener = Network.addListener('networkStatusChange', status => {
       setIsOnline(status.connected);
    });

    // Initialize Capacitor Features
    const initCapacitor = async () => {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#002147' });
      } catch (e) {
        console.debug('Capacitor plugins not active (web mode)');
      }
    };
    initCapacitor();

    // Load Projects from IndexedDB
    const loadProjects = async () => {
      try {
        const storedProjects = await dbService.getProjects();
        if (storedProjects && storedProjects.length > 0) {
          setProjects(storedProjects);
        } else {
          setProjects(MOCK_PROJECTS);
        }
      } catch (e) {
        console.error("Failed to load projects from DB", e);
        setProjects(MOCK_PROJECTS);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadProjects();

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
    const savedSessionCountry = localStorage.getItem(STORAGE_SESSION_COUNTRY);
    const savedSessionAdmin = localStorage.getItem(STORAGE_SESSION_IS_ADMIN);
    
    if (savedSessionUser) {
        setUserName(savedSessionUser);
        if (savedSessionCountry) setUserCountry(savedSessionCountry);
        setIsLoggedIn(true);
        if (savedSessionAdmin === 'true') {
            setIsAdmin(true);
        }
    }

    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    return () => {
        networkListener.then(h => h.remove());
    };
  }, []);

  // Handle Hardware Back Button (Android)
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (pendingProject) {
        setPendingProject(null);
        return;
      }
      if (showCreateProject) {
        setShowCreateProject(false);
        return;
      }
      
      if (currentView === AppView.PROJECT_DETAIL || currentView === AppView.PROFILE) {
        setActiveProject(null);
        setCurrentView(AppView.HOME);
      } else if (currentView === AppView.HOME) {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then(f => f.remove());
    };
  }, [currentView, pendingProject, showCreateProject]);

  // Save projects to IndexedDB whenever they change
  useEffect(() => {
    if (isDataLoaded) {
      const saveToDB = async () => {
        try {
          await dbService.saveProjects(projects);
        } catch (error) {
          console.error("Failed to save projects to DB:", error);
          alert("Warning: Failed to save changes. Your device storage might be full.");
        }
      };
      saveToDB();
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

  // Process Upload Queue
  useEffect(() => {
    const processQueue = async () => {
      const pendingItem = uploadQueue.find(item => item.status === 'pending');
      if (!pendingItem || !activeProject) return;

      setUploadQueue(prev => prev.map(item => 
        item.id === pendingItem.id ? { ...item, status: 'uploading' } : item
      ));

      try {
        const readFileWithProgress = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
              if (e.target?.result) resolve(e.target.result as string);
              else reject(new Error("Failed to read file"));
            };
            
            reader.onerror = () => reject(new Error("File reading failed"));
            
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              setUploadQueue(prev => prev.map(item => 
                item.id === pendingItem.id ? { ...item, progress: Math.min(progress, 90) } : item
              ));
              if (progress >= 90) clearInterval(interval);
            }, 50);

            reader.readAsDataURL(file);
          });
        };

        const resultUrl = await readFileWithProgress(pendingItem.file);
        
        setUploadQueue(prev => prev.map(item => 
            item.id === pendingItem.id ? { ...item, progress: 100, status: 'completed' } : item
        ));

        const type = pendingItem.file.type.startsWith('video') ? 'video' : 'photo';
        const newItem: MediaItem = {
            id: Date.now().toString() + Math.random().toString(),
            type: type,
            url: resultUrl,
            description: pendingItem.file.name.split('.')[0],
            thumbnail: type === 'video' ? undefined : resultUrl 
        };

        setProjects(prevProjects => {
             return prevProjects.map(p => {
                if (p.id === activeProject.id) {
                    const updatedUpdates = [...p.updates];
                    updatedUpdates[activeUpdateIndex] = {
                        ...updatedUpdates[activeUpdateIndex],
                        media: [newItem, ...updatedUpdates[activeUpdateIndex].media]
                    };
                    
                    // Update active project ref immediately
                    const updatedProject = { ...p, updates: updatedUpdates };
                    setActiveProject(updatedProject);
                    return updatedProject;
                }
                return p;
            });
        });
        
        await new Promise(r => setTimeout(r, 500));

      } catch (error) {
        setUploadQueue(prev => prev.map(item => 
            item.id === pendingItem.id ? { ...item, status: 'error' } : item
        ));
      }
    };

    if (uploadQueue.some(i => i.status === 'pending')) {
        processQueue();
    } else {
        const allDone = uploadQueue.length > 0 && uploadQueue.every(i => i.status === 'completed' || i.status === 'error');
        if (allDone) {
            const timer = setTimeout(() => {
                setUploadQueue([]);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }
  }, [uploadQueue, activeProject, activeUpdateIndex, projects]);


  // --- HANDLERS ---

  const handleGlobalLogin = (name: string, countryCode: string | undefined, remember: boolean, adminAccess: boolean) => {
    setUserName(name);
    if (countryCode) setUserCountry(countryCode);
    setIsLoggedIn(true);
    setIsAdmin(adminAccess);
    
    if (remember) {
        localStorage.setItem(STORAGE_SESSION_KEY, name);
        if (countryCode) localStorage.setItem(STORAGE_SESSION_COUNTRY, countryCode);
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
    localStorage.removeItem(STORAGE_SESSION_COUNTRY);
    localStorage.removeItem(STORAGE_SESSION_IS_ADMIN);
  };

  const handleProjectSelect = (project: Project) => {
    if (isAdmin) {
        setActiveProject(project);
        setActiveUpdateIndex(0);
        setCurrentView(AppView.PROJECT_DETAIL);
        return;
    }

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
      const newUnlocked = [...unlockedProjectIds, pendingProject.id];
      setUnlockedProjectIds(newUnlocked);
      localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(newUnlocked));

      setActiveProject(pendingProject);
      setActiveUpdateIndex(0);
      setPendingProject(null);
      setCurrentView(AppView.PROJECT_DETAIL);
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this project?')) {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
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

    const latestWeek = activeProject.updates.length > 0 
        ? Math.max(...activeProject.updates.map(u => u.weekNumber)) 
        : 0;
    
    const nextWeek = latestWeek + 1;
    const today = new Date().toISOString().split('T')[0];

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
            return { ...p, updates: [newUpdate, ...p.updates] };
        }
        return p;
    });

    setProjects(updatedProjects);
    setActiveProject(updatedProjects.find(p => p.id === activeProject.id) || null);
    setActiveUpdateIndex(0);
  };

  const handleUpdateField = (field: string, value: string | number) => {
    if (!activeProject) return;
    
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
    setActiveProject(updatedProjects.find(p => p.id === activeProject.id) || null);
  };

  const handleManualAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newMediaUrl) return;

    let finalThumbnail = undefined;
    
    // Check if it's a YouTube URL to set a better thumbnail automatically
    if (newMediaType === 'video') {
        const ytMatch = newMediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch) {
            finalThumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        } else {
            // For other videos, assume URL might be the thumbnail or let grid handle it (it uses <video> tag now)
            // But we can set the URL as thumbnail if user desires, or leave generic
            finalThumbnail = newMediaUrl; 
        }
    } else {
        // For photos, the URL is the thumbnail
        finalThumbnail = newMediaUrl;
    }

    const newItem: MediaItem = {
        id: Date.now().toString(),
        type: newMediaType,
        url: newMediaUrl,
        description: newMediaDesc || 'External Link',
        thumbnail: finalThumbnail
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

  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files) as File[];
    const validFiles: File[] = [];
    // Increase limit to 100MB because IndexedDB can handle it
    const maxSizeBytes = 100 * 1024 * 1024; 

    files.forEach(file => {
        if (file.size > maxSizeBytes) {
            alert(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 100MB allowed. Please use 'Add via URL' for larger files.`);
        } else {
            validFiles.push(file);
        }
    });

    if (validFiles.length === 0) return;

    const newItems: UploadItem[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending'
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };


  // --- SUB-COMPONENTS ---

  const AppHeader = () => (
    <header className="bg-brand-dark/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 h-16 flex items-center safe-top">
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

  if (!isOnline) {
      return (
          <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-brand-blue shadow-2xl">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-4">No Internet Connection</h1>
              <p className="text-slate-400 max-w-md">This application requires an active internet connection to access real-time construction data. Please check your network settings.</p>
          </div>
      );
  }

  if (!isLoggedIn) {
    return <GlobalAuth onLogin={handleGlobalLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-slate-200 selection:bg-brand-blue/30 selection:text-brand-blue">
      
      {pendingProject && (
        <LoginScreen 
          targetProject={pendingProject} 
          onLogin={handleAuthenticationSuccess}
          onCancel={() => setPendingProject(null)}
        />
      )}

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
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-slate-400">{isAdmin ? text.adminRole : text.clientRole}</p>
                                {!isAdmin && (
                                    <>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <p className="text-slate-400 flex items-center gap-1 text-sm">
                                            {(() => {
                                                const c = COUNTRIES.find(c => c.code === userCountry);
                                                return c ? <>{c.flag} {c.name}</> : userCountry;
                                            })()}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {installPrompt && (
                             <Button variant="primary" onClick={handleInstallApp}>
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {text.installApp}
                             </Button>
                        )}
                        <Button variant="secondary" onClick={handleLogout}>{text.signOut}</Button>
                    </div>
                </div>
                
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
                    
                    <div className="lg:col-span-2 space-y-8">
                        
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
                                        <label className="text-xs text-slate-400 block mb-1 uppercase font-bold">3D Capture (Polycam URL or Embed Code)</label>
                                        <div className="flex gap-2">
                                            <textarea 
                                                className="flex-1 bg-brand-dark border border-slate-700 rounded px-4 py-2 text-white text-sm focus:border-brand-blue outline-none transition-colors min-h-[80px]"
                                                value={activeProject.updates[activeUpdateIndex].splatUrl || ''} 
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    const srcMatch = val.match(/src=["'](.*?)["']/);
                                                    if (val.includes('<iframe') && srcMatch && srcMatch[1]) {
                                                        val = srcMatch[1];
                                                    }
                                                    handleUpdateField('splatUrl', val);
                                                }}
                                                placeholder="Paste Polycam URL or <iframe src='...'> code here..."
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">System automatically extracts the URL if you paste an iframe code.</p>
                                    </div>

                                    <div className="border-t border-slate-800 pt-4">
                                         <label className="text-xs text-slate-400 block mb-2 uppercase font-bold">Add New Media</label>
                                         
                                         <div className="mb-4">
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-slate-700 hover:border-brand-blue/50 hover:bg-brand-blue/5 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                            >
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef}
                                                    className="hidden" 
                                                    multiple 
                                                    accept="image/*,video/*" 
                                                    onChange={handleBulkFileSelect} 
                                                />
                                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                </div>
                                                <p className="text-sm text-slate-300 font-medium">Click to select photos or videos</p>
                                                <p className="text-xs text-slate-500 mt-1">Supports bulk upload (Max 100MB/file)</p>
                                            </div>

                                            {uploadQueue.length > 0 && (
                                                <div className="mt-4 space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Upload Queue</h4>
                                                    {uploadQueue.map(item => (
                                                        <div key={item.id} className="flex items-center gap-3 text-sm">
                                                            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                                                {item.status === 'completed' ? (
                                                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                ) : item.status === 'error' ? (
                                                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="truncate text-slate-300">{item.file.name}</span>
                                                                    <span className="text-xs text-slate-500">{item.progress}%</span>
                                                                </div>
                                                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : 'bg-brand-blue'}`} 
                                                                        style={{ width: `${item.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                         </div>

                                         <div className="relative flex py-2 items-center">
                                            <div className="flex-grow border-t border-slate-800"></div>
                                            <span className="flex-shrink-0 mx-4 text-slate-600 text-xs font-bold uppercase">OR Add via URL</span>
                                            <div className="flex-grow border-t border-slate-800"></div>
                                         </div>

                                         <form onSubmit={handleManualAddMedia} className="space-y-3 mt-2">
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
                                                <div className="flex-1 flex gap-2">
                                                    <input 
                                                        className="flex-1 bg-brand-dark border border-slate-700 rounded px-4 py-2 text-white text-sm focus:border-brand-blue outline-none"
                                                        placeholder="External Media URL (e.g. YouTube, hosted image)..."
                                                        value={newMediaUrl}
                                                        onChange={(e) => setNewMediaUrl(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <input 
                                                    className="flex-1 bg-brand-dark border border-slate-700 rounded px-4 py-2 text-white text-sm focus:border-brand-blue outline-none"
                                                    placeholder="Description..."
                                                    value={newMediaDesc}
                                                    onChange={(e) => setNewMediaDesc(e.target.value)}
                                                />
                                                <Button type="submit" className="!py-2">Add URL</Button>
                                            </div>
                                         </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-[500px]">
                            <SplatViewer url={activeProject.updates[activeUpdateIndex].splatUrl} title={`Week ${activeProject.updates[activeUpdateIndex].weekNumber}`} />
                        </div>

                        <div>
                            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Site Footage
                            </h3>
                            <MediaGrid media={activeProject.updates[activeUpdateIndex].media} />
                        </div>
                    </div>

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
