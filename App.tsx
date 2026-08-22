import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Project, MediaItem, AppView, WeeklyUpdate, User } from "./types";
import { GlobalAuth } from "./components/GlobalAuth";
import { Button } from "./components/Button";
import { SplatViewer } from "./components/SplatViewer";
import { MediaGrid } from "./components/MediaGrid";
import { Footer } from "./components/Footer";
import { InstallButton } from "./components/InstallButton";
import { Language, translations } from "./translations";
import { dbService } from "./services/db";
import { logoutUser } from "./services/authService";
import { supabase } from "./services/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WeatherWidget } from "./components/WeatherWidget";
import { ProjectCalendar } from "./components/ProjectCalendar";
import { LocationPicker } from "./components/LocationPicker";
import { OnboardingGuide } from "./components/OnboardingGuide";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { BuildingConfigurator } from "./components/BuildingConfigurator";
import { InteractiveViewer } from "./components/InteractiveViewer";
import { UpdateComments } from "./components/UpdateComments";
import { ImageCropperModal } from "./components/ImageCropperModal";
import {
  WifiOff,
  ArrowLeft,
  Map,
  LayoutGrid,
  List,
  Trash2,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
Box, MessageCircle, Calendar, User as UserIcon, LogOut } from "lucide-react";
import { Logo } from "./components/Logo";
import { CustomTooltip } from "./components/ChartTooltip";
const STORAGE_LANGUAGE_KEY = "ndertimi_language_pref";
const DEMO_INTERACTIVE_BUILDING: any = {
  id: "b1",
  name: "Sunset Residences",
  mainImageUrl:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=1600&fit=crop",
  floors: [
    {
      id: "floor-1",
      name: "Penthouse Floor",
      svgPath: "M 20 15 L 80 15 L 80 25 L 20 25 Z",
      floorPlanUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      units: [
        {
          id: "unit-ph1",
          name: "Penthouse A",
          svgPath: "M 10 10 L 90 10 L 90 90 L 10 90 Z",
          floorPlanUrl:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
          specs: { beds: 4, baths: 3.5, area: 250, price: "$2,500,000" },
          status: "available",
        },
      ],
    },
    {
      id: "floor-2",
      name: "7th Floor",
      svgPath: "M 20 40 L 80 40 L 80 50 L 20 50 Z",
      floorPlanUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      units: [
        {
          id: "unit-7a",
          name: "Unit 7A",
          svgPath: "M 10 10 L 45 10 L 45 90 L 10 90 Z",
          floorPlanUrl:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
          specs: { beds: 2, baths: 2, area: 110, price: "$850,000" },
          status: "available",
        },
        {
          id: "unit-7b",
          name: "Unit 7B",
          svgPath: "M 55 10 L 90 10 L 90 90 L 55 90 Z",
          floorPlanUrl:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
          specs: { beds: 3, baths: 2, area: 140, price: "$1,150,000" },
          status: "sold",
        },
      ],
    },
  ],
};
interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
}
const App: React.FC = () => {
  /* --- STATE --- */
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [language, setLanguage] = useState<Language>("en");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectTab, setProjectTab] = useState<'wall' | 'explore' | 'discussion' | 'calendar'>('wall');
  const [projectListView, setProjectListView] = useState<"grid" | "list">(
    "grid",
  );
  const [activeUpdateIndex, setActiveUpdateIndex] = useState<number>(0);
  const [heroTab, setHeroTab] = useState<"3d" | "360">("3d");
  const activeProjectsList = projects.filter((p) => !p.deletedAt);
  const binnedProjectsList = projects.filter((p) => p.deletedAt);
  /* UI State */
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const isAdmin = user?.isAdmin || false;
  const [showCreateProject, setShowCreateProject] = useState(false);
      
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAddingWeek, setIsAddingWeek] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!isAdmin && currentView === AppView.PROJECT_DETAIL && activeProject) {
      const hasSeenOnboarding = localStorage.getItem(
        `onboarding_${activeProject.id}`,
      );
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
      localStorage.setItem(`onboarding_${activeProject.id}`, "true");
    }
  };
  /* Admin Edit State */
  const [newMediaCategory, setNewMediaCategory] = useState<
    "inside" | "outside" | "drone" | "interior" | "other"
  >("outside");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  /* Profile Edit State */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [newProjectForm, setNewProjectForm] = useState<{
    name: string;
    clientName: string;
    location: string;
    accessCode: string;
    description: string;
    thumbnailUrl: string;
    coordinates?: { lat: number; lng: number };
  }>({
    name: "",
    clientName: "",
    location: "",
    accessCode: "",
    description: "",
    thumbnailUrl: "",
  });
  /* Swipe Gesture State */
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(
    null,
  ); /* Keep a ref of the active project ID to sync real-time updates correctly */
  const activeProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeProjectIdRef.current = activeProject?.id || null;
  }, [activeProject]);
  const text = translations[language]; /* Touch Handlers for Swipe Back */
  const onTouchStart = (e: React.TouchEvent) => {
    /* Disable swipe gesture if we are in full screen media mode */
    if (isFullScreenMode) return;
    setTouchEnd(null);
    if (
      currentView !== AppView.HOME &&
      e.targetTouches[0].clientX < window.innerWidth * 0.2
    ) {
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
    const isRightSwipe = distance < -75;
    /* Negative distance means moving right */
    if (isRightSwipe && currentView !== AppView.HOME) {
      /* Trigger Back */
      setActiveProject(null);
      setCurrentView(AppView.HOME);
    }
  };
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const appMetadata = session.user.app_metadata || {};
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          name: metadata.full_name || metadata.name || "User",
          username: metadata.username || session.user.email?.split("@")[0] || "user",
          photoURL: metadata.avatar_url || metadata.picture || null,
          isAdmin: appMetadata.is_admin === true || metadata.is_admin === true,
          countryCode: metadata.country_code,
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
          name: metadata.full_name || metadata.name || "User",
          username: metadata.username || session.user.email?.split("@")[0] || "user",
          photoURL: metadata.avatar_url || metadata.picture || null,
          isAdmin: appMetadata.is_admin === true || metadata.is_admin === true,
          countryCode: metadata.country_code,
        });
      } else {
        setUser(null);
        setCurrentView(AppView.HOME);
        setActiveProject(null);
      }
    });

    const unsubscribeDB = dbService.subscribeProjects((updatedProjects) => {
      setProjects(updatedProjects);
      setLoadingProjects(false);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      subscription.unsubscribe();
      unsubscribeDB();
    };
  }, []);
  useEffect(() => {
    const processQueue = async () => {
      const pendingItem = uploadQueue.find((item) => item.status === "pending");
      if (!pendingItem || !activeProject) return;
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === pendingItem.id ? { ...item, status: "uploading" } : item,
        ),
      );
      try {
        const downloadUrl = await dbService.uploadFile(
          pendingItem.file,
          activeProject.id,
          (progress) => {
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === pendingItem.id ? { ...item, progress } : item,
              ),
            );
          },
        );
        const type = pendingItem.file.type.startsWith("video")
          ? "video"
          : "photo";
        const newItem: MediaItem = {
          id: Date.now().toString() + Math.random().toString(),
          type: type,
          url: downloadUrl,
          description: pendingItem.file.name.split(".")[0],
          category: newMediaCategory,
        };
        const updatedUpdates = [...activeProject.updates];
        updatedUpdates[activeUpdateIndex] = {
          ...updatedUpdates[activeUpdateIndex],
          media: [newItem, ...updatedUpdates[activeUpdateIndex].media],
        };
        const newProjectState = { ...activeProject, updates: updatedUpdates };
        setActiveProject(newProjectState);
        await dbService.updateProject(newProjectState);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id
              ? { ...item, status: "completed", progress: 100 }
              : item,
          ),
        );
      } catch (error) {
        console.error("Upload error:", error);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id ? { ...item, status: "error" } : item,
          ),
        );
      }
    };
    const currentlyUploading = uploadQueue.some(
      (i) => i.status === "uploading",
    );
    if (
      !currentlyUploading &&
      uploadQueue.some((i) => i.status === "pending")
    ) {
      processQueue();
    }
  }, [uploadQueue, activeProject, activeUpdateIndex, newMediaCategory]);
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView(AppView.HOME);
  };
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone.",
      )
    )
      return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response from server:", text);
        throw new Error(
          `Unexpected server response: ${text.substring(0, 50)}...`,
        );
      }
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete account");
      }
      /* User is deleted from backend, now log out locally */ await handleLogout();
      alert("Your account has been permanently deleted.");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      alert(
        err.message ||
          "An error occurred while deleting your account. Please ensure the server has SUPABASE_SERVICE_ROLE_KEY configured.",
      );
    }
  };
  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    let firstIndex = 0;
    const updates = project.updates || [];
    if (!isAdmin) {
      firstIndex = updates.findIndex((u) => u.status !== "draft");
      if (firstIndex === -1) firstIndex = 0;
    }
    setActiveUpdateIndex(firstIndex);
    setProjectTab('wall');
    setCurrentView(AppView.PROJECT_DETAIL);
  };
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingProject(true);
    const newProject: Project = {
      id: `p_${Date.now()}`,
      ...newProjectForm,
      thumbnailUrl:
        newProjectForm.thumbnailUrl ||
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000",
      updates: [
        {
          weekNumber: 1,
          date: new Date().toISOString().split("T")[0],
          title: "Project Start",
          summary: "Initial setup.",
          media: [],
          stats: { completion: 0, workersOnSite: 0, weatherConditions: "N/A" },
        },
      ],
    };
    try {
      await dbService.addProject(newProject);
      setShowCreateProject(false);
      setNewProjectForm({
        name: "",
        clientName: "",
        location: "",
        accessCode: "",
        description: "",
        thumbnailUrl: "",
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreatingProject(false);
    }
  };
  const handleAddNewWeek = async () => {
    if (!activeProject) return;
    setIsAddingWeek(true);
    try {
      const latestWeek =
        activeProject.updates.length > 0
          ? Math.max(...activeProject.updates.map((u) => u.weekNumber))
          : 0;
      const newUpdate: WeeklyUpdate = {
        weekNumber: latestWeek + 1,
        date: new Date().toISOString().split("T")[0],
        title: `Week ${latestWeek + 1}`,
        summary: "",
        media: [],
        status: "draft",
        stats: {
          completion: activeProject.updates[0]?.stats.completion || 0,
          workersOnSite: 0,
          weatherConditions: "Sunny",
        },
      };
      const updatedProject = {
        ...activeProject,
        updates: [newUpdate, ...activeProject.updates],
      };
      setActiveProject(updatedProject);
      await dbService.updateProject(updatedProject);
      setActiveUpdateIndex(0);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingWeek(false);
    }
  };
  const extractUrlFromEmbed = (input: string) => {
    if (!input) return "";
    const srcMatch = input.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : input;
  };
  const handleUpdateField = async (field: string, value: any) => {
    if (!activeProject) return;
    const updatedUpdates = [...activeProject.updates];
    const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
    if (field.startsWith("stats.")) {
      const statKey = field.split(".")[1];
      currentUpdate.stats = { ...currentUpdate.stats, [statKey]: value };
    } else {
      (currentUpdate as any)[field] = value;
    }
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };
    setActiveProject(updatedProject);
    try {
      await dbService.updateProject(updatedProject);
    } catch {}
  };
  const handleUpdateFields = async (updates: Record<string, any>) => {
    if (!activeProject) return;
    const updatedUpdates = [...activeProject.updates];
    const currentUpdate = { ...updatedUpdates[activeUpdateIndex] };
    Object.entries(updates).forEach(([field, value]) => {
      if (field.startsWith("stats.")) {
        const statKey = field.split(".")[1];
        currentUpdate.stats = { ...currentUpdate.stats, [statKey]: value };
      } else {
        (currentUpdate as any)[field] = value;
      }
    });
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };
    setActiveProject(updatedProject);
    try {
      await dbService.updateProject(updatedProject);
    } catch {}
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
      timestamp: new Date().toISOString(),
    };
    currentUpdate.comments = [...(currentUpdate.comments || []), newComment];
    updatedUpdates[activeUpdateIndex] = currentUpdate;
    const updatedProject = { ...activeProject, updates: updatedUpdates };
    setActiveProject(updatedProject);
    try {
      await dbService.updateProject(updatedProject);
    } catch {}
  };
  const handleProjectField = async (field: string, value: any) => {
    if (!activeProject) return;
    const updatedProject = { ...activeProject, [field]: value };
    setActiveProject(updatedProject);
    try {
      await dbService.updateProject(updatedProject);
    } catch {}
  };
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files.length || !activeProject) return;
    const file =
      e.target.files[0]; /* Set for cropping instead of direct upload */
    setCropImageSrc(URL.createObjectURL(file));
  };
  const handleCropComplete = async (croppedFile: File) => {
    if (!activeProject) return;
    setCropImageSrc(null);
    setIsUploadingThumbnail(true);
    try {
      const downloadUrl = await dbService.uploadFile(
        croppedFile,
        activeProject.id,
      );
      await handleProjectField("thumbnailUrl", downloadUrl);
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
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editName },
      });
      if (error) throw error;
      setUser({ ...user, name: editName });
      setIsEditingProfile(false);
    } catch (err: any) {
      alert("Failed to update profile:" + err.message);
    }
  };

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
            <button onClick={() => setCurrentView(AppView.PROFILE)} className={`p-2 rounded-full transition-all duration-300 ease-in-out ${currentView === AppView.PROFILE ? "bg-brand-blue text-white" : "bg-white/5 text-slate-500 hover:text-white"}`}>
              <UserIcon className="w-5 h-5" />
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
                  <button className={`p-2 rounded-lg ${projectListView === "grid" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`} onClick={() => setProjectListView("grid")}>
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button className={`p-2 rounded-lg ${projectListView === "list" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`} onClick={() => setProjectListView("list")}>
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
                    className={`group bg-slate-900/40 rounded-lg overflow-hidden border border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all ${projectListView === "list" ? "flex items-center p-4 gap-6" : ""}`}
                  >
                    <div className={`relative overflow-hidden ${projectListView === "list" ? "w-32 h-24 shrink-0 rounded-md" : "aspect-video"}`}>
                      <img src={p.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                    <div className={`${projectListView === "list" ? "flex-1" : "p-6"}`}>
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
                    <WeatherWidget location={activeProject.location} date={activeProject.updates[activeUpdateIndex].date} />
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
                  onClick={() => setProjectTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${projectTab === tab.id ? 'text-brand-blue' : 'text-slate-500 hover:text-white'}`}
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
              project={activeProject}
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
