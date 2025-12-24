
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

interface EmbedViewerProps {
  url?: string;
  title: string;
  type: '3d' | '360';
}

export const SplatViewer: React.FC<EmbedViewerProps> = ({ url, title, type }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFullscreen = isNativeFullscreen || isCssFullscreen;

  useEffect(() => {
    const handleFullscreenChange = () => {
        const isFs = !!document.fullscreenElement;
        setIsNativeFullscreen(isFs);
        if (isFs) {
             setIsInteracting(true);
             setIsCssFullscreen(false); 
        } else {
             if (!isCssFullscreen) setIsInteracting(false);
        }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); 

    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isCssFullscreen]);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    
    // Exit Logic
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
        return;
    }
    if (isCssFullscreen) {
        setIsCssFullscreen(false);
        setIsInteracting(false);
        return;
    }

    // Enter Logic
    const el = containerRef.current as any;
    const requestFs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;

    if (requestFs) {
        const promise = requestFs.call(el);
        if (promise && typeof promise.catch === 'function') {
            promise.catch((err: any) => {
                console.log("Native fullscreen rejected, using CSS fallback", err);
                setIsCssFullscreen(true);
                setIsInteracting(true);
            });
        }
    } else {
        setIsCssFullscreen(true);
        setIsInteracting(true);
    }
  };

  if (!url) {
    return (
      <div className="w-full h-full min-h-[350px] bg-slate-900/40 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
           {type === '3d' ? (
             <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>
           ) : (
             <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
           )}
        </div>
        <p className="text-sm font-medium">No {type === '3d' ? '3D Scan' : 'Virtual Tour'} available for this update.</p>
      </div>
    );
  }

  return (
    <div 
        ref={containerRef}
        className={`
            transition-all duration-300 bg-black group shadow-2xl overflow-hidden
            ${isFullscreen 
                ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' 
                : 'relative w-full aspect-video rounded-3xl border border-white/5'
            }
        `}
        onMouseLeave={() => !isFullscreen && setIsInteracting(false)}
    >
      {/* Top Controls Bar - Always visible in fullscreen */}
      {isFullscreen && (
          <div className="absolute top-0 left-0 right-0 z-[110] p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="pointer-events-auto">
                 <button 
                    onClick={() => setIsInteracting(!isInteracting)}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
                 >
                    {isInteracting ? 'Lock View' : 'Unlock View'}
                 </button>
              </div>
              
              <button 
                onClick={toggleFullScreen}
                className="pointer-events-auto p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-90 flex items-center gap-2 pr-5"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="font-bold text-sm uppercase tracking-wider">Close</span>
              </button>
          </div>
      )}

      {/* Standard Fullscreen Toggle (Only valid when NOT in fullscreen) */}
      {!isFullscreen && (
        <button 
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 z-[50] p-3 bg-black/60 hover:bg-brand-blue backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all border border-white/10 hover:scale-110 shadow-lg active:scale-95"
            title="Enter Fullscreen"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/80 backdrop-blur-md pointer-events-none">
          <div className="flex flex-col items-center">
             <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-brand-blue/20 border-t-brand-blue animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-[8px] font-bold text-brand-blue">{type.toUpperCase()}</span>
                </div>
             </div>
             <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Loading...</p>
          </div>
        </div>
      )}

      {!isLoading && !isInteracting && !isFullscreen && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all duration-300">
            <Button 
                onClick={() => setIsInteracting(true)}
                className="shadow-2xl !bg-white !text-slate-950 hover:scale-105"
            >
                {type === '3d' ? 'Tap to Explore' : 'Start Tour'}
            </Button>
        </div>
      )}

      <iframe 
        src={url}
        title={title}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isInteracting || isFullscreen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onLoad={() => setIsLoading(false)}
        allowFullScreen
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
      
      {/* Controls Hint */}
      {isInteracting && !isFullscreen && (
         <div className="absolute top-4 left-4 z-30 animate-in fade-in slide-in-from-top-2 pointer-events-none">
            <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Interactive Mode</span>
            </div>
         </div>
      )}
    </div>
  );
};
