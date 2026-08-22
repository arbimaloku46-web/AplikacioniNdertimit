
import React, { useState, useEffect, useRef } from 'react';
import { motion } from "motion/react";
import { Project, MediaItem, AppView, WeeklyUpdate, User } from './types';
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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherWidget } from './components/WeatherWidget';
import { ProjectCalendar } from './components/ProjectCalendar';
import { LocationPicker } from './components/LocationPicker';
import { OnboardingGuide } from './components/OnboardingGuide';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BuildingConfigurator } from './components/BuildingConfigurator';
import { InteractiveViewer } from './components/InteractiveViewer';
import { UpdateComments } from './components/UpdateComments';
import { ImageCropperModal } from './components/ImageCropperModal';
import { WifiOff, ArrowLeft, Map, LayoutGrid, List, Trash2, ArchiveRestore, ChevronDown, ChevronUp } from 'lucide-react';
import { Logo } from './components/Logo';
import { CustomTooltip } from './components/ChartTooltip';

const STORAGE_LANGUAGE_KEY = 'ndertimi_language_pref';

const DEMO_INTERACTIVE_BUILDING: any = {
  id: 'b1',
  name: 'Sunset Residences',
  mainImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=1600&fit=crop",
  floors: [
    {
      id: 'floor-1',
      name: 'Penthouse Floor',
      svgPath: "M 20 15 L 80 15 L 80 25 L 20 25 Z",
      floorPlanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      units: [
        {
          id: 'unit-ph1',
          name: 'Penthouse A',
          svgPath: "M 10 10 L 90 10 L 90 90 L 10 90 Z",
          floorPlanUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
          specs: { beds: 4, baths: 3.5, totalArea: 250, insideArea: 200, sharedArea: 50, price: "$2,500,000" },
          status: 'available'
        }
      ]
    },
    {
      id: 'floor-2',
      name: '7th Floor',
      svgPath: "M 20 40 L 80 40 L 80 50 L 20 50 Z",
      floorPlanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      units: [
        {
          id: 'unit-7a',
          name: 'Unit 7A',
          svgPath: "M 10 10 L 45 10 L 45 90 L 10 90 Z",
          floorPlanUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
          specs: { beds: 2, baths: 2, area: 110, price: "$850,000" },
          status: 'available'
        },
        {
          id: 'unit-7b',
          name: 'Unit 7B',
          svgPath: "M 55 10 L 90 10 L 90 90 L 55 90 Z",
          floorPlanUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
          specs: { beds: 3, baths: 2, area: 140, price: "$1,150,000" },
          status: 'sold'
        }
      ]
    }
  ]
};

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [language, setLanguage] = useState<Language>('en');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectListView, setProjectListView] = useState<'grid' | 'list'>('grid');
  const [activeUpdateIndex, setActiveUpdateIndex] = useState<number>(0);
  const [heroTab, setHeroTab] = useState<'3d' | '360'>('3d');
  
  const activeProjectsList = projects.filter(p => !p.deletedAt);
  const binnedProjectsList = projects.filter(p => p.deletedAt);

  // UI State
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  
  const isAdmin = user?.isAdmin || false;
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showInteractiveBuilding, setShowInteractiveBuilding] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAddingWeek, setIsAddingWeek] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isAdmin && currentView === AppView.PROJECT_DETAIL && activeProject) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${activeProject.id}`);
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    } else {
        setShowOnboarding(false);
    }
  }, [isAdmin, currentView, activeProject]);

  const handleDismissOnboarding = () => {
      setShowOnboarding(false);
      if (activeProject) {
          localStorage.setItem(`onboarding_${activeProject.id}`, 'true');
      }
  };

  // Admin Edit State
  const [newMediaCategory, setNewMediaCategory] = useState<'inside' | 'outside' | 'drone' | 'interior' | 'other'>('outside');
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');

  const [newProjectForm, setNewProjectForm] = useState<{
    name: string; clientName: string; location: string; accessCode: string; description: string; thumbnailUrl: string; coordinates?: { lat: number; lng: number };
  }>({
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
    // Disable swipe gesture if we are in full screen media mode
    if (isFullScreenMode) return;
    
    setTouchEnd(null);
    if (currentView !== AppView.HOME && e.targetTouches[0].clientX < window.innerWidth * 0.2) {
         setTouchStart(e.targetTouches[0].clientX);
    } else {
         setTouchStart(null);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
     if (isFullScreenMode) return;
     if (touchStart) setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isFullScreenMode) return;
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
      setIsAuthChecking(false);
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
        
        if (window.location.hash && window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setUser(null);
        setCurrentView(AppView.HOME);
        setActiveProject(null);
      }
      setIsAuthChecking(false);
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

  const handleDeleteAccount = async () => {
      if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
      
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("No active session");
          
          const response = await fetch('/api/delete-account', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${session.access_token}`
              }
          });
          
          let data;
          const text = await response.text();
          try {
              data = JSON.parse(text);
          } catch (e) {
              console.error("Non-JSON response from server:", text);
              throw new Error(`Unexpected server response: ${text.substring(0, 50)}...`);
          }
          
          if (!response.ok) {
              throw new Error(data?.error || 'Failed to delete account');
          }
          
          // User is deleted from backend, now log out locally
          await handleLogout();
          alert("Your account has been permanently deleted.");
      } catch (err: any) {
          console.error("Error deleting account:", err);
          alert(err.message || "An error occurred while deleting your account. Please ensure the server has SUPABASE_SERVICE_ROLE_KEY configured.");
      }
  };

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    let firstIndex = 0;
    if (!isAdmin) {
      firstIndex = project.updates.findIndex(u => u.status !== 'draft');
      if (firstIndex === -1) firstIndex = 0;
    }
    setActiveUpdateIndex(firstIndex);
    setCurrentView(AppView.PROJECT_DETAIL);
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
            status: 'draft',
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

  const handleUpdateFields = async (updates: Record<string, any>) => {
    if (!activeProject) return;
    const updatedUpdates = [...activeProject.updates];
    const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
    
    Object.entries(updates).forEach(([field, value]) => {
        if (field.startsWith('stats.')) {
            const statKey = field.split('.')[1];
            currentUpdate.stats = { ...currentUpdate.stats, [statKey]: value };
        } else { (currentUpdate as any)[field] = value; }
    });
    
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };
    setActiveProject(updatedProject);
    try { await dbService.updateProject(updatedProject); } catch {}
  };

  const handleAddComment = async (text: string) => {
    if (!activeProject || !user) return;
    const updatedUpdates = [...activeProject.updates];
    const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
    const newComment = {
      id: Math.random().toString(),
      text,
      authorName: user.name,
      authorId: user.uid,
      isAdmin: user.isAdmin || false,
      timestamp: new Date().toISOString()
    };
    currentUpdate.comments = [...(currentUpdate.comments || []), newComment];
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };
    setActiveProject(updatedProject);
    try { await dbService.updateProject(updatedProject); } catch {}
  };

  const handleProjectField = async (field: string, value: any) => {
    if (!activeProject) return;
    const updatedProject = { ...activeProject, [field]: value };
    setActiveProject(updatedProject);
    try { await dbService.updateProject(updatedProject); } catch {}
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !activeProject) return;
    const file = e.target.files[0];
    
    // Set for cropping instead of direct upload
    setCropImageSrc(URL.createObjectURL(file));
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!activeProject) return;
    setCropImageSrc(null);
    setIsUploadingThumbnail(true);
    try {
        const downloadUrl = await dbService.uploadFile(croppedFile, activeProject.id);
        await handleProjectField('thumbnailUrl', downloadUrl);
    } catch (error) {
        console.error("Failed to upload thumbnail", error);
        alert("Failed to upload image");
    } finally {
        setIsUploadingThumbnail(false);
    }
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
  const renderHeader = () => {
    // If in full screen mode (lightbox or 3D view), hide the header completely
    if (isFullScreenMode) return null;

    return (
        <header className="bg-brand-dark/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 h-16 flex items-center shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="max-w-7xl mx-auto w-full px-6 md:px-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {currentView !== AppView.HOME ? (
                        <button 
                            onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}
                            className="p-2 -ml-2 rounded-full text-white hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            <span className="text-sm font-extrabold tracking-tight md:hidden">Back</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }}>
                            <Logo className="h-8 md:h-10" />
                        </div>
                    )}
                    
                    {/* Desktop Breadcrumb for Non-Home */}
                    {currentView !== AppView.HOME && (
                        <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm border-l border-white/10 pl-4 ml-2">
                            <span onClick={() => { setActiveProject(null); setCurrentView(AppView.HOME); }} className="cursor-pointer hover:text-white transition-all duration-300 ease-in-out">Home</span>
                            <span>/</span>
                            <span className="text-white font-medium truncate max-w-[200px]">{activeProject ? activeProject.name : text.profileTitle}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:gap-5">
                    <InstallButton language={language} />
                    <button 
                        onClick={() => setCurrentView(AppView.PROFILE)} 
                        className={`p-2 rounded-full transition-all duration-300 ease-in-out ${currentView === AppView.PROFILE ? 'bg-brand-blue text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>
                    {/* Hide logout on mobile to save space, it is available in profile */}
                    <button onClick={handleLogout} className="hidden md:block p-2 rounded-full bg-white/5 text-slate-500 hover:text-red-400 transition-all duration-300 ease-in-out" title={text.logout}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" /></svg>
                    </button>
                </div>
            </div>
        </header>
    );
  };

  if (!isOnline) return <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white"><h1>Offline</h1></div>;
  
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

  if (!user) return <GlobalAuth onLogin={(u) => setUser(u)} language={language} setLanguage={setLanguage} />;

  return (
    <div 
        className="bg-brand-dark min-h-screen font-sans text-slate-500"
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
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-white px-6 py-2.5 text-xs font-extrabold tracking-tight flex items-center justify-center shadow-lg shadow-amber-500/20 backdrop-blur-md">
          <WifiOff className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-center">You are currently offline. Viewing cached data and may not have the most recent updates.</span>
        </div>
      )}

      {showCreateProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 overflow-y-auto">
             <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-display font-extrabold tracking-tight text-white mb-8">New Project Entry</h2>
                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2"><label className="text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-widest mb-2 block">Project Name</label><input required className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-white" value={newProjectForm.name} onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} /></div>
                    <div><label className="text-[10px] font-extrabold tracking-tight text-slate-500 uppercase mb-2 block">Client</label><input required className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-white" value={newProjectForm.clientName} onChange={e => setNewProjectForm({...newProjectForm, clientName: e.target.value})} /></div>
                    <div><label className="text-[10px] font-extrabold tracking-tight text-slate-500 uppercase mb-2 block">Location (City, Area)</label><input required className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-white" value={newProjectForm.location} onChange={e => setNewProjectForm({...newProjectForm, location: e.target.value})} /></div>
                    
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-extrabold tracking-tight text-slate-500 uppercase tracking-widest mb-2 block">Exact Map Location</label>
                        <LocationPicker 
                            onLocationSelect={(lat, lng) => setNewProjectForm({...newProjectForm, coordinates: { lat, lng }})} 
                        />
                        <p className="text-[10px] text-slate-500 mt-2">Click on the map to place the project marker.</p>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-6 mt-4">
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
            <main className="flex-1 max-w-7xl mx-auto w-full px-8 pt-12 pb-24 md:pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
                            {isAdmin ? 'Management' : 'Progress'} <span className="text-brand-blue">Suite</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm md:text-base">Active construction projects & site monitoring.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
                            <button className={`p-2 rounded-lg transition-all duration-300 ease-in-out ${projectListView === 'grid' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setProjectListView('grid')} title="Grid View">
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button className={`p-2 rounded-lg transition-all duration-300 ease-in-out ${projectListView === 'list' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setProjectListView('list')} title="List View">
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                        {isAdmin && <Button onClick={() => setShowCreateProject(true)}>{text.addNewProject}</Button>}
                    </div>
                </div>
                


                {loadingProjects ? (
                    <div className="flex items-center justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                    </div>
                ) : (
                    <>
                        {activeProjectsList.length > 0 ? (
                            <div className={projectListView === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "grid grid-cols-1 gap-4"}>
                                {activeProjectsList.map((p, i) => (
                                    <motion.div 
                                        key={p.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                                        onClick={() => handleProjectSelect(p)} 
                                        className={`group bg-slate-900/40 rounded-3xl overflow-hidden border border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all hover:-translate-y-1 active:scale-[0.98] ${projectListView === 'list' ? 'flex items-center p-4' : ''}`}
                                    >
                                        {projectListView === 'grid' ? (
                                            <>
                                                <div className="aspect-video relative overflow-hidden">
                                                    <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                                </div>
                                                <div className="p-8 md:p-8">
                                                    <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white group-hover:text-brand-blue transition-all duration-300 ease-in-out">{p.name}</h3>
                                                    <p className="text-slate-500 text-xs font-extrabold tracking-tight uppercase tracking-widest mt-2">{p.clientName} • {p.location}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-lg">
                                                    <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                </div>
                                                <div className="ml-6 flex-1">
                                                    <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-white group-hover:text-brand-blue transition-all duration-300 ease-in-out">{p.name}</h3>
                                                    <p className="text-slate-500 text-xs font-extrabold tracking-tight uppercase tracking-widest mt-2">{p.clientName} • {p.location}</p>
                                                </div>
                                                <div className="w-10 h-10 mr-4 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-brand-blue group-hover:text-white transition-all shrink-0">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                                <div className="inline-block p-6 rounded-full bg-slate-800/80 backdrop-blur-xl mb-4">
                                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h3 className="text-xl font-extrabold tracking-tight text-white mb-2">{text.noProjectsTitle}</h3>
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
            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-10 relative z-0">
                {/* Project Header - Mobile Optimized */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight mb-2">{activeProject.name}</h1>
                        <p className="text-slate-500 text-sm flex items-center gap-2 mb-4">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           {activeProject.location}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                        {/* Interactive Building Viewer Button */}
                        {(activeProject.interactiveBuilding || isAdmin) && (
                          <button 
                            onClick={() => setShowInteractiveBuilding(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-2 rounded-2xl text-sm font-extrabold tracking-tight shadow-lg shadow-emerald-500/20 transition-all group"
                          >
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Explore Building
                          </button>
                        )}
                        
                        {isAdmin && (
                          <>
                          <button 
                            onClick={() => setCurrentView(AppView.MAPPER)}
                            className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-xl hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95 text-white px-6 py-2 rounded-2xl text-sm font-extrabold tracking-tight shadow-lg transition-all"
                          >
                            <Map className="w-4 h-4" />
                            Configure Building
                          </button>

                          <button 
                            onClick={async () => {
                                if(window.confirm('Are you sure you want to move this project to the bin? It will be permanently deleted after 30 days.')) {
                                    const pCopy = {...activeProject, deletedAt: new Date().toISOString()};
                                    await dbService.updateProject(pCopy);
                                    setActiveProject(null);
                                    setCurrentView(AppView.HOME);
                                }
                            }}
                            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-6 py-2 rounded-2xl text-sm font-extrabold tracking-tight transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                            Bin Project
                          </button>
                          </>
                        )}
                        </div>
                    </div>
                    {/* Progress Bar - Compact on Mobile */}
                    <div className="bg-white/5 border border-white/5 px-5 py-3 rounded-2xl backdrop-blur-sm flex items-center justify-between md:block w-full md:w-auto">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight tracking-widest block mb-0 md:mb-1 mr-4 md:mr-0">Total Progress</span>
                        <div className="flex items-center gap-6">
                           <div className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">{activeProject.updates[activeUpdateIndex].stats.completion}%</div>
                           <div className="w-20 md:w-24 h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue transition-all duration-1000" style={{ width: `${activeProject.updates[activeUpdateIndex].stats.completion}%` }} />
                           </div>
                        </div>
                    </div>
                </div>

                {/* Week Selector - Swipable */}
                <div className="flex gap-3 overflow-x-auto pb-6 mb-8 no-scrollbar snap-x">
                    {isAdmin && <button onClick={handleAddNewWeek} disabled={isAddingWeek} className="min-w-[80px] md:min-w-[120px] h-16 md:h-20 border-2 border-dashed border-brand-blue/30 rounded-2xl md:rounded-3xl flex items-center justify-center text-brand-blue hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all text-xl shrink-0 snap-start">+</button>}
                    {activeProject.updates.map((u, i) => {
                        if (!isAdmin && u.status === 'draft') return null;
                        return (
                        <button key={i} onClick={() => setActiveUpdateIndex(i)} className={`relative min-w-[130px] md:min-w-[160px] p-6 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left group shrink-0 snap-start ${i === activeUpdateIndex ? 'border-brand-blue bg-brand-blue/10 shadow-[0_10px_30px_rgba(34,100,171,0.1)]' : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/90 backdrop-blur-2xl'}`}>
                            {isAdmin && u.status === 'draft' && <span className="absolute top-2 right-3 text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-extrabold tracking-tight uppercase">Draft</span>}
                            <span className="text-[8px] md:text-[9px] block text-slate-500 font-extrabold tracking-tight uppercase tracking-widest mb-1">Week {u.weekNumber} • {u.date}</span>
                            <span className={`text-xs md:text-sm font-extrabold tracking-tight block truncate ${i === activeUpdateIndex ? 'text-white' : 'text-slate-500 group-hover:text-slate-500'}`}>{u.title || `Update ${u.weekNumber}`}</span>
                        </button>
                    )})}
                </div>

                {!isAdmin && (!activeProject.updates[activeUpdateIndex] || activeProject.updates[activeUpdateIndex].status === 'draft') ? (
                    <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                        <div className="inline-block p-6 rounded-full bg-slate-800/80 backdrop-blur-xl mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight text-white mb-2">No Updates Published</h3>
                        <p className="text-slate-500 max-w-md mx-auto">The project manager has not published any weekly updates for this project yet. Please check back later.</p>
                    </div>
                ) : (
                <>
                {/* Hero Experience Suite */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-16 relative z-10">
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        <div className="flex flex-col gap-6 md:gap-8">
                           <div className="flex items-center justify-between">
                              {/* Mobile Optimized Segmented Control */}
                              <div className="flex bg-slate-900/80 p-1 rounded-2xl md:rounded-2xl border border-white/5 w-full md:w-auto">
                                 <button onClick={() => setHeroTab('3d')} className={`flex-1 md:flex-none px-6 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-[10px] font-extrabold tracking-tight uppercase tracking-widest transition-all ${heroTab === '3d' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'}`}>3D Model</button>
                                 <button onClick={() => setHeroTab('360')} className={`flex-1 md:flex-none px-6 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-[10px] font-extrabold tracking-tight uppercase tracking-widest transition-all ${heroTab === '360' ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'}`}>360 Tour</button>
                              </div>
                           </div>
                           <div id="splat-viewer" className="relative">
                              {heroTab === '3d' ? (
                                <SplatViewer type="3d" url={activeProject.updates[activeUpdateIndex].splatUrl} title="Polycam 3D Render" onFullScreenChange={setIsFullScreenMode} />
                              ) : (
                                <SplatViewer type="360" url={activeProject.updates[activeUpdateIndex].floorfyUrl} title="Floorfy 360 Tour" onFullScreenChange={setIsFullScreenMode} />
                              )}
                           </div>
                        </div>

                        {/* Gallery Section */}
                        <div id="media-gallery" className="pt-8 md:pt-10 border-t border-white/5">
                           <h2 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-white mb-6 md:mb-8">Site Footage Gallery</h2>
                           <MediaGrid 
                               media={activeProject.updates[activeUpdateIndex].media} 
                               onFullScreenChange={setIsFullScreenMode} 
                               isAdmin={isAdmin}
                               onMediaUpdate={(mediaId, updatedMedia) => {
                                   const newMedia = activeProject.updates[activeUpdateIndex].media.map(m => m.id === mediaId ? updatedMedia : m);
                                   handleUpdateField('media', newMedia);
                               }}
                               onMediaReorder={(newMediaOrder) => {
                                   handleUpdateField('media', newMediaOrder);
                               }}
                           />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8 relative z-20">
                        {/* Site Stats & Summary */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 backdrop-blur-xl relative z-30 shadow-2xl">
                            <h3 className="text-xs uppercase font-extrabold tracking-tight text-brand-blue mb-6 tracking-widest">Executive Update</h3>
                            
                            <div className="h-48 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={[...(isAdmin ? activeProject.updates : activeProject.updates.filter(u => u.status !== 'draft'))].sort((a, b) => a.weekNumber - b.weekNumber)}>
                                        <XAxis dataKey="weekNumber" stroke="#64748b" fontSize={10} tickFormatter={(tick) => `W${tick}`} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(tick) => `${tick}%`} width={35} />
                                        <Tooltip 
                                            content={<CustomTooltip />}
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="stats.completion" 
                                            stroke="#3b82f6" 
                                            strokeWidth={3} 
                                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} 
                                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {isAdmin ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Project Name</label><input className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.name} onChange={e => handleProjectField('name', e.target.value)} /></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Project Client</label><input className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.clientName} onChange={e => handleProjectField('clientName', e.target.value)} /></div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex gap-6 items-center">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-lg relative">
                                            {isUploadingThumbnail && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-brand-blue rounded-full animate-spin" />
                                                </div>
                                            )}
                                            <img src={activeProject.thumbnailUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Main Project Photo</label>
                                            <div className="relative group overflow-hidden inline-block">
                                                <button className="bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 text-white px-6 py-3 rounded-2xl text-sm font-extrabold tracking-tight hover:border-brand-blue/50 transition-all cursor-pointer inline-flex items-center gap-2">
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                    Upload New Photo
                                                </button>
                                                <input type="file" accept="image/*" onChange={(e) => { handleThumbnailUpload(e); e.target.value = ''; }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={isUploadingThumbnail} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                        <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Project Location</label><input className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.location} onChange={e => handleProjectField('location', e.target.value)} /></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Update Date</label><input type="date" className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white [color-scheme:dark]" value={activeProject.updates[activeUpdateIndex].date} onChange={e => handleUpdateField('date', e.target.value)} /></div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight tracking-widest block mb-2">Exact Map Location</label>
                                        <LocationPicker 
                                            initialPosition={activeProject.coordinates} 
                                            onLocationSelect={(lat, lng) => handleProjectField('coordinates', { lat, lng })} 
                                        />
                                        <p className="text-[10px] text-slate-500 mt-2">Click on the map to update the project marker location.</p>
                                    </div>
                                    {/* Admin Inputs - Kept same structure */}
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight tracking-widest block mb-2">3D Polycam Embed</label>
                                        <input 
                                            className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-xs font-mono text-brand-blue" 
                                            value={activeProject.updates[activeUpdateIndex].splatUrl || ''} 
                                            onChange={e => handleUpdateField('splatUrl', extractUrlFromEmbed(e.target.value))} 
                                            placeholder="URL..." 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight tracking-widest block mb-2">360 Floorfy Embed</label>
                                        <input 
                                            className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-xs font-mono text-brand-blue" 
                                            value={activeProject.updates[activeUpdateIndex].floorfyUrl || ''} 
                                            onChange={e => handleUpdateField('floorfyUrl', extractUrlFromEmbed(e.target.value))} 
                                            placeholder="URL..." 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Completion %</label><input type="number" className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.updates[activeUpdateIndex].stats.completion} onChange={e => handleUpdateField('stats.completion', parseInt(e.target.value))} /></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Total Workers</label><input type="number" className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.updates[activeUpdateIndex].stats.workersOnSite} onChange={e => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))} /></div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-white/5">
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Worker Breakdown</label>
                                        {(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || []).map((wb, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                                <input className="flex-1 bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-xl px-4 py-2 text-xs text-white" placeholder="Type (e.g. Facade)" value={wb.type} onChange={e => {
                                                    const newBreakdown = [...(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || [])];
                                                    newBreakdown[idx] = { ...newBreakdown[idx], type: e.target.value };
                                                    handleUpdateField('stats.workerBreakdown', newBreakdown);
                                                }} />
                                                <input type="number" className="w-20 bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-xl px-4 py-2 text-xs text-white" placeholder="Count" value={wb.count || ''} onChange={e => {
                                                    const newBreakdown = [...(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || [])];
                                                    newBreakdown[idx] = { ...newBreakdown[idx], count: parseInt(e.target.value) || 0 };
                                                    const total = newBreakdown.reduce((sum, item) => sum + item.count, 0);
                                                    handleUpdateFields({
                                                        'stats.workerBreakdown': newBreakdown,
                                                        'stats.workersOnSite': total
                                                    });
                                                }} />
                                                <button className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors" onClick={() => {
                                                    const newBreakdown = (activeProject.updates[activeUpdateIndex].stats.workerBreakdown || []).filter((_, i) => i !== idx);
                                                    const total = newBreakdown.reduce((sum, item) => sum + item.count, 0);
                                                    handleUpdateFields({
                                                        'stats.workerBreakdown': newBreakdown,
                                                        'stats.workersOnSite': total
                                                    });
                                                }}><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <button className="text-brand-blue text-[10px] font-extrabold uppercase tracking-widest mt-2 flex items-center hover:text-blue-400 transition-colors" onClick={() => {
                                            const newBreakdown = [...(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || []), { type: '', count: 0 }];
                                            handleUpdateField('stats.workerBreakdown', newBreakdown);
                                        }}>+ Add Worker Type</button>
                                        <p className="text-[10px] text-slate-500 mt-2">Will auto-calculate total workers when breakdown is provided.</p>
                                    </div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Update Title</label><input type="text" className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.updates[activeUpdateIndex].title || ''} onChange={e => handleUpdateField('title', e.target.value)} /></div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Narrative</label><textarea className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 h-32 resize-none text-sm text-white" value={activeProject.updates[activeUpdateIndex].summary} onChange={e => handleUpdateField('summary', e.target.value)} /></div>
                                    <div className="pt-4 border-t border-white/5">
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Update Visibility Status</label>
                                        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/5 w-full">
                                            <button 
                                                onClick={() => handleUpdateField('status', 'draft')} 
                                                className={`flex-1 px-6 py-3 rounded-lg text-xs font-extrabold tracking-tight uppercase tracking-widest transition-all ${activeProject.updates[activeUpdateIndex].status === 'draft' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-500'}`}
                                            >
                                                Draft
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateField('status', 'published')} 
                                                className={`flex-1 px-6 py-3 rounded-lg text-xs font-extrabold tracking-tight uppercase tracking-widest transition-all ${activeProject.updates[activeUpdateIndex].status !== 'draft' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-500'}`}
                                            >
                                                Published
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2">Drafts are only visible to administrators.</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Weather Preview</label>
                                        <div className="h-24"><WeatherWidget location={activeProject.location} date={activeProject.updates[activeUpdateIndex].date} /></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 md:space-y-8">
                                    <div>
                                       <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white leading-snug">{activeProject.updates[activeUpdateIndex].title}</h2>
                                       <p className="text-base text-slate-500 mt-4 leading-relaxed whitespace-pre-line">{activeProject.updates[activeUpdateIndex].summary || 'No summary notes for this week.'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-6 pt-6 md:pt-8 border-t border-white/5">
                                        <WeatherWidget location={activeProject.location} date={activeProject.updates[activeUpdateIndex].date} />
                                        <div className="bg-white/5 p-3 md:p-6 rounded-2xl md:rounded-2xl flex flex-col justify-between h-full min-h-[80px] relative group cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                          <div className="flex justify-between items-center w-full mb-1">
                                            <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase">Workforce</span>
                                            {(activeProject.updates[activeUpdateIndex].stats.workerBreakdown?.length || 0) > 0 && (
                                              <ChevronDown className="w-4 h-4 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            )}
                                          </div>
                                          <span className="text-white text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-none">{activeProject.updates[activeUpdateIndex].stats.workersOnSite} <span className="text-sm text-slate-500 font-sans font-medium">Active</span></span>
                                          
                                          {/* Dropdown content */}
                                          {(activeProject.updates[activeUpdateIndex].stats.workerBreakdown?.length || 0) > 0 && (
                                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-slate-800 border border-white/10 rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-2xl pointer-events-none group-hover:pointer-events-auto">
                                              <div className="flex flex-col gap-2">
                                                {activeProject.updates[activeUpdateIndex].stats.workerBreakdown!.map((wb, idx) => (
                                                  <div key={idx} className="flex justify-between items-center text-xs text-white border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-slate-400 font-medium">{wb.type || 'Unknown'}</span>
                                                    <span className="font-extrabold">{wb.count}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                    </div>
                                    {activeProject.coordinates && (
                                        <div className="pt-6 md:pt-8 border-t border-white/5">
                                            <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase tracking-widest block mb-4">Exact Location</span>
                                            <LocationPicker 
                                                initialPosition={activeProject.coordinates}
                                                readOnly={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Admin Media Uploader */}
                        {isAdmin && (
                           <div className="bg-slate-900/80 border border-brand-blue/20 rounded-3xl p-8 md:p-8">
                               <h4 className="text-[10px] uppercase font-extrabold tracking-tight text-brand-blue mb-4 md:mb-6 tracking-widest">Media Upload Lab</h4>
                               <div className="space-y-6">
                                  <div>
                                     <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Tag</label>
                                     <select value={newMediaCategory} onChange={(e) => setNewMediaCategory(e.target.value as any)} className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-xs">
                                        <option value="outside">Outside / Drone</option>
                                        <option value="inside">Inside / Structural</option>
                                        <option value="interior">Interior Finishing</option>
                                        <option value="drone">Drone Mapping</option>
                                        <option value="other">Other</option>
                                     </select>
                                  </div>
                                  <div className="border-2 border-dashed border-white/10 p-8 rounded-2xl text-center relative hover:border-brand-blue/50 transition-all duration-300 ease-in-out">
                                     <input type="file" multiple accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={(e) => {
                                        if (e.target.files) {
                                           const files = Array.from(e.target.files).map(f => ({ id: Math.random().toString(), file: f, progress: 0, status: 'pending' as const }));
                                           setUploadQueue(prev => [...prev, ...files]);
                                        }
                                     }} />
                                     <div className="pointer-events-none">
                                        <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <p className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase">Click or Drag to Upload (Max 1.5GB)</p>
                                     </div>
                                  </div>
                                  
                                  {/* Upload Queue List */}
                                  {uploadQueue.length > 0 && (
                                      <div className="space-y-3 mt-4">
                                          {uploadQueue.map(item => (
                                              <div key={item.id} className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-3 overflow-hidden">
                                                         <div className="w-8 h-8 rounded bg-slate-800/80 backdrop-blur-xl flex items-center justify-center shrink-0 text-slate-500">
                                                             {item.file.type.startsWith('video') ? (
                                                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                             ) : (
                                                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                             )}
                                                         </div>
                                                         <span className="text-xs text-slate-500 font-medium truncate">{item.file.name}</span>
                                                      </div>
                                                      <span className={`text-[10px] font-extrabold tracking-tight uppercase tracking-wider ${
                                                          item.status === 'completed' ? 'text-emerald-500' : 
                                                          item.status === 'error' ? 'text-red-500' : 
                                                          'text-brand-blue'
                                                      }`}>
                                                          {item.status === 'completed' ? 'Done' : item.status === 'error' ? 'Failed' : `${Math.round(item.progress)}%`}
                                                      </span>
                                                  </div>
                                                  {/* Progress Bar */}
                                                  {(item.status === 'uploading' || item.status === 'pending') && (
                                                      <div className="h-1 bg-slate-800/80 backdrop-blur-xl rounded-full overflow-hidden w-full">
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
                                                    className="text-[10px] text-slate-500 hover:text-white uppercase font-extrabold tracking-tight tracking-widest"
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                    {/* Weekly Discussion Tab */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300">
                        <button 
                            onClick={() => setIsDiscussionExpanded(!isDiscussionExpanded)}
                            className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-white/[0.02] transition-colors"
                        >
                            <h3 className="text-sm uppercase font-extrabold tracking-tight text-brand-blue tracking-widest flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                Weekly Discussion
                            </h3>
                            {isDiscussionExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </button>
                        
                        {isDiscussionExpanded && user && activeProject.updates[activeUpdateIndex] && (
                            <div className="p-6 md:p-8 pt-0 border-t border-white/5">
                                <UpdateComments
                                    comments={activeProject.updates[activeUpdateIndex].comments || []}
                                    currentUser={user}
                                    onAddComment={handleAddComment}
                                />
                            </div>
                        )}
                    </div>

                    {/* Project Calendar Tab */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300">
                        <button 
                            onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                            className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-white/[0.02] transition-colors"
                        >
                            <h3 className="text-sm uppercase font-extrabold tracking-tight text-brand-blue tracking-widest flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Project Calendar
                            </h3>
                            {isCalendarExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </button>

                        {isCalendarExpanded && (
                            <div className="p-6 md:p-8 pt-0 border-t border-white/5">
                                <ProjectCalendar 
                                    updates={isAdmin ? activeProject.updates : activeProject.updates.filter(u => u.status !== 'draft')}
                                    activeIndex={isAdmin ? activeUpdateIndex : activeProject.updates.filter(u => u.status !== 'draft').findIndex(u => u.weekNumber === activeProject.updates[activeUpdateIndex]?.weekNumber)}
                                    onSelect={(idx) => {
                                        if (isAdmin) {
                                            setActiveUpdateIndex(idx);
                                        } else {
                                            const visible = activeProject.updates.filter(u => u.status !== 'draft');
                                            const originalIdx = activeProject.updates.findIndex(u => u.weekNumber === visible[idx].weekNumber);
                                            setActiveUpdateIndex(originalIdx);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                </>
                )}
                
                <OnboardingGuide isVisible={showOnboarding} onDismiss={handleDismissOnboarding} />
            </main>
         </div>
      )}

      {currentView === AppView.PROFILE && user && (
        <div className="min-h-screen flex flex-col bg-brand-dark">
            {renderHeader()}
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 pt-8 pb-24 md:pt-12 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6 mb-8 md:mb-10">
                    <button onClick={() => setCurrentView(AppView.HOME)} className="p-2 rounded-full bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-300 ease-in-out">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight text-white">{text.profileTitle}</h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8">
                    {/* Left Column: User Card */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand-blue/20 to-transparent pointer-events-none" />
                            
                            <div className="relative mb-6 group">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-blue flex items-center justify-center text-white text-3xl md:text-4xl font-extrabold tracking-tight shadow-2xl border-4 border-slate-900 overflow-hidden">
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
                                    <input className="w-full bg-slate-950 border border-brand-blue rounded-2xl px-6 py-2 text-white text-center" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => setIsEditingProfile(false)} className="px-6 py-2 rounded-lg bg-slate-800/80 backdrop-blur-xl text-slate-500 text-xs font-extrabold tracking-tight">Cancel</button>
                                        <button onClick={handleSaveProfile} className="px-6 py-2 rounded-lg bg-brand-blue text-white text-xs font-extrabold tracking-tight">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-1">{user.name}</h2>
                                    <p className="text-slate-500 text-xs md:text-sm mb-6 font-mono truncate max-w-full">{user.email}</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-6 py-1.5 rounded-full text-[10px] font-extrabold tracking-tight uppercase tracking-widest border ${user.isAdmin ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}>
                                            {user.isAdmin ? text.adminRole : text.clientRole}
                                        </span>
                                        <button onClick={() => { setEditName(user.name); setIsEditingProfile(true); }} className="p-2 rounded-full bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-300 ease-in-out">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                             <h3 className="text-xs font-extrabold tracking-tight text-slate-500 uppercase tracking-widest mb-4">Account Security</h3>
                             <div className="space-y-4">
                               <Button variant="secondary" onClick={handleLogout} className="w-full !bg-white/5 !text-slate-300 !border-white/10 hover:!bg-white/10 hover:!text-white hover:!border-white/20 justify-between group">
                                  <span>{text.signOut}</span>
                                  <svg className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" /></svg>
                               </Button>
                               <div className="pt-4 border-t border-white/5">
                                   <Button variant="secondary" onClick={handleDeleteAccount} className="w-full !bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20 hover:!border-red-500/40 justify-between group">
                                      <span>Delete Account</span>
                                      <Trash2 className="w-5 h-5 opacity-50 group-hover:scale-110 transition-transform" />
                                   </Button>
                               </div>
                             </div>
                        </div>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 backdrop-blur-xl">
                            <h3 className="text-lg font-extrabold tracking-tight text-white mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                {text.languageSettings}
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <button onClick={() => { setLanguage('en'); localStorage.setItem(STORAGE_LANGUAGE_KEY, 'en'); }} className={`relative p-6 md:p-8 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${language === 'en' ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">🇬🇧</div>
                                    <span className={`block text-xl md:text-2xl mb-2 ${language === 'en' ? 'text-white' : 'text-slate-500 grayscale'}`}>🇬🇧</span>
                                    <span className={`font-extrabold tracking-tight block text-sm md:text-base ${language === 'en' ? 'text-white' : 'text-slate-500'}`}>English</span>
                                </button>
                                <button onClick={() => { setLanguage('sq'); localStorage.setItem(STORAGE_LANGUAGE_KEY, 'sq'); }} className={`relative p-6 md:p-8 rounded-2xl border text-left transition-all duration-300 group overflow-hidden ${language === 'sq' ? 'bg-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">🇦🇱</div>
                                    <span className={`block text-xl md:text-2xl mb-2 ${language === 'sq' ? 'text-white' : 'text-slate-500 grayscale'}`}>🇦🇱</span>
                                    <span className={`font-extrabold tracking-tight block text-sm md:text-base ${language === 'sq' ? 'text-white' : 'text-slate-500'}`}>Shqip</span>
                                </button>
                            </div>
                        </div>

                        {user.isAdmin && (
                            <>
                            <div className="bg-slate-900/50 border border-brand-blue/20 rounded-3xl p-8 md:p-8 backdrop-blur-xl mt-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full" />
                                <h3 className="text-lg font-extrabold tracking-tight text-brand-blue mb-6 flex items-center gap-2">
                                    <Map className="w-5 h-5" />
                                    Admin Tools
                                </h3>
                                <button onClick={() => setCurrentView(AppView.MAPPER)} className="w-full bg-slate-950 border border-brand-blue/30 hover:border-brand-blue hover:bg-blue-600 hover:scale-[1.02] active:scale-95 text-white rounded-2xl p-6 md:p-8 transition-all group flex items-center justify-between shadow-lg shadow-brand-blue/5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                            <Map className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-extrabold tracking-tight text-white text-base md:text-lg mb-1 group-hover:text-brand-blue transition-all duration-300 ease-in-out">Coordinate Mapper</h4>
                                            <p className="text-slate-500 text-xs md:text-sm">Generate SVG polygons for interactive building layers</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-brand-blue opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            
                            <div className="bg-slate-900/50 border border-rose-500/20 rounded-3xl p-8 md:p-8 backdrop-blur-xl mt-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full" />
                                <h3 className="text-lg font-extrabold tracking-tight text-rose-500 mb-6 flex items-center gap-2">
                                    <Trash2 className="w-5 h-5" />
                                    Binned Projects (Auto-delete after 30 days)
                                </h3>
                                
                                {binnedProjectsList.length > 0 ? (
                                    <div className="grid gap-6">
                                        {binnedProjectsList.map(p => (
                                            <div key={p.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-6 rounded-2xl bg-slate-950 border border-rose-500/10 transition-all">
                                                <div className="w-16 h-12 md:w-20 md:h-16 rounded-2xl overflow-hidden shadow-lg relative shrink-0">
                                                    <img src={p.thumbnailUrl} className="w-full h-full object-cover grayscale opacity-70" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-extrabold tracking-tight text-sm md:text-base">{p.name}</h4>
                                                    <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wider mt-1">Deleted: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'Unknown'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                                    <button onClick={async () => {
                                                        const pCopy = {...p};
                                                        delete pCopy.deletedAt;
                                                        await dbService.updateProject(pCopy);
                                                    }} className="px-4 py-2 bg-white/5 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                                                        <ArchiveRestore className="w-4 h-4" />
                                                        Restore
                                                    </button>
                                                    <button onClick={async () => {
                                                        if(window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) {
                                                            await dbService.deleteProject(p.id);
                                                        }
                                                    }} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete Forever
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">The bin is empty.</p>
                                )}
                            </div>
                            </>
                        )}

                        {!user.isAdmin && (
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 backdrop-blur-xl">
                                <h3 className="text-lg font-extrabold tracking-tight text-white mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    {text.myUnlockedProjects}
                                </h3>
                                
                                {activeProjectsList.length > 0 ? (
                                    <div className="grid gap-6">
                                        {activeProjectsList.map(p => (
                                            <div key={p.id} onClick={() => handleProjectSelect(p)} className="group flex items-center gap-6 md:gap-5 p-3 md:p-6 rounded-2xl bg-slate-950 border border-white/5 cursor-pointer hover:border-brand-blue/50 hover:bg-slate-900/90 backdrop-blur-2xl transition-all active:scale-[0.99]">
                                                <div className="w-16 h-12 md:w-20 md:h-16 rounded-2xl overflow-hidden shadow-lg relative">
                                                    <img src={p.thumbnailUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-extrabold tracking-tight text-sm md:text-base group-hover:text-brand-blue transition-all duration-300 ease-in-out">{p.name}</h4>
                                                    <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wider mt-1">{p.location}</p>
                                                </div>
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 hover:scale-[1.02] active:scale-95 group-hover:text-white transition-all">
                                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 md:py-10 px-8 rounded-2xl bg-slate-950/50 border border-dashed border-white/10">
                                        <p className="text-sm text-slate-500 mb-4">{text.noProjectsAccess}</p>
                                        <Button variant="primary" onClick={() => setCurrentView(AppView.HOME)} className="!py-2 !px-8 !text-xs">
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
      
      {currentView === AppView.MAPPER && user?.isAdmin && activeProject && (
        <div className="min-h-screen bg-brand-dark overflow-y-auto">
          {renderHeader()}
          <div className="pt-20 px-6 md:px-8 pb-12">
            <BuildingConfigurator 
              project={activeProject} 
              onSave={async (updatedProject) => {
                await dbService.updateProject(updatedProject);
                setActiveProject(updatedProject);
                setCurrentView(AppView.PROJECT_DETAIL);
              }}
              onClose={() => setCurrentView(AppView.PROJECT_DETAIL)}
            />
          </div>
        </div>
      )}

      {currentView !== AppView.PROJECT_DETAIL && currentView !== AppView.MAPPER && (
        <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} text={text} />
      )}

      {showInteractiveBuilding && activeProject && (
        <InteractiveViewer 
          data={activeProject.interactiveBuilding || DEMO_INTERACTIVE_BUILDING}
          onClose={() => setShowInteractiveBuilding(false)}
        />
      )}
    </div>
  );
};

export default App;
