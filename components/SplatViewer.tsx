import React, { useState } from 'react';

interface SplatViewerProps {
  url?: string;
  title: string;
}

export const SplatViewer: React.FC<SplatViewerProps> = ({ url, title }) => {
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
          <div className="flex flex-col items-center">
             <svg className="animate-spin h-8 w-8 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-400 text-sm tracking-widest">LOADING 3D SCENE</span>
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-white tracking-wide">INTERACTIVE 3D</span>
        </div>
      </div>

      {/* 
        NOTE: In a real production app, this would be a <iframe src={url}> pointing to Polycam/Luma.
        For this demo, we use a placeholder image that looks like a 3D view but handles the 'load' event to simulate 3D loading.
      */}
      <iframe 
        src="https://poly.cam/capture/6266a808-2560-4a1e-8361-805579007155" 
        title={title}
        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
        onLoad={() => setIsLoading(false)}
        allowFullScreen
      ></iframe>
      
      {/* Fake controller overlay for aesthetics since we can't really control the iframe content easily */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="glass-panel p-2 rounded-lg text-white/70 text-xs">
            Use Mouse to Rotate & Zoom
         </div>
      </div>
    </div>
  );
};