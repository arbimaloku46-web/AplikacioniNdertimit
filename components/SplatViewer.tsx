
import React, { useState } from 'react';
import { Button } from './Button';

interface EmbedViewerProps {
  url?: string;
  title: string;
  type: '3d' | '360';
}

export const SplatViewer: React.FC<EmbedViewerProps> = ({ url, title, type }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

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
        className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black group shadow-2xl"
        onMouseLeave={() => setIsInteracting(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/80 backdrop-blur-md pointer-events-none">
          <div className="flex flex-col items-center">
             <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-brand-blue/20 border-t-brand-blue animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-[8px] font-bold text-brand-blue">{type.toUpperCase()}</span>
                </div>
             </div>
             <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Initializing Environment</p>
          </div>
        </div>
      )}

      {!isLoading && !isInteracting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all duration-300">
            <Button 
                onClick={() => setIsInteracting(true)}
                className="shadow-2xl !bg-white !text-slate-950 hover:scale-105"
            >
                {type === '3d' ? 'Explore 3D Model' : 'Start 360 Tour'}
            </Button>
            <p className="mt-4 text-[10px] text-white/60 font-medium px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              Interactive Viewport Enabled
            </p>
        </div>
      )}

      {isInteracting && (
        <div className="absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-top-2">
            <button
                onClick={() => setIsInteracting(false)}
                className="bg-brand-dark/90 hover:bg-brand-blue text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur border border-white/10 transition-all flex items-center gap-2"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                EXIT INTERACTIVE MODE
            </button>
        </div>
      )}

      <iframe 
        src={url}
        title={title}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onLoad={() => setIsLoading(false)}
        allowFullScreen
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
      
      {isInteracting && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 hidden md:block">
            <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl text-white/70 text-[10px] border border-white/10 font-bold uppercase tracking-widest">
                {type === '3d' ? 'LMB: Rotate • Wheel: Zoom • RMB: Pan' : 'Click & Drag to Look Around'}
            </div>
        </div>
      )}
    </div>
  );
};
