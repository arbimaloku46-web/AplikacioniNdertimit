import React, { useState } from 'react';
import { Button } from './Button';

interface SplatViewerProps {
  url?: string;
  title: string;
}

export const SplatViewer: React.FC<SplatViewerProps> = ({ url, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  if (!url) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>No 3D Scan Available for this Week</p>
      </div>
    );
  }

  return (
    <div 
        className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group"
        onMouseLeave={() => setIsInteracting(false)}
    >
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900 overflow-hidden pointer-events-none">
          {/* Placeholder Image Background */}
          <img 
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop" 
            alt="Loading Preview" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110"
          />

          <div className="relative z-20 flex flex-col items-center">
             <svg className="animate-spin h-8 w-8 text-amber-500 mb-4 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="bg-slate-950/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 shadow-xl">
                <span className="text-slate-300 text-xs font-bold tracking-widest">LOADING 3D SCENE</span>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Overlay (Prevents Scroll Jacking) */}
      {!isLoading && !isInteracting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300">
            <Button 
                onClick={() => setIsInteracting(true)}
                className="shadow-2xl !bg-slate-900/90 !border-white/20 hover:!bg-brand-blue hover:!border-brand-blue backdrop-blur-md"
                variant="outline"
            >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explore 3D Space
            </Button>
        </div>
      )}

      {/* Exit Button for Mobile/Touch users who get stuck */}
      {isInteracting && (
        <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-top-2">
            <button
                onClick={() => setIsInteracting(false)}
                className="bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur border border-red-500/20 transition-all flex items-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Exploring
            </button>
        </div>
      )}

      <iframe 
        src={url}
        title={title}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onLoad={() => setIsLoading(false)}
        allowFullScreen
      ></iframe>
      
      {/* Hint UI - Only show when interacting */}
      {isInteracting && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 hidden md:block">
            <div className="glass-panel p-2 rounded-lg text-white/70 text-xs border border-white/10">
                Scroll to Zoom • Drag to Rotate
            </div>
        </div>
      )}
    </div>
  );
};