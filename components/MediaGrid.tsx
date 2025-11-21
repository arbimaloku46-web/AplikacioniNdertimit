import React, { useState } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  media: MediaItem[];
}

export const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedMedia(item)}
            className="group relative aspect-video bg-slate-900 rounded-lg overflow-hidden cursor-pointer border border-slate-800 hover:border-amber-500/50 transition-all"
          >
            {item.type === 'video' ? (
               <div className="w-full h-full relative">
                  <img 
                    src={item.thumbnail || item.url} 
                    alt={item.description} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
               </div>
            ) : item.type === '360' ? (
                <div className="w-full h-full relative">
                  <img 
                    src={item.url} 
                    alt={item.description} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                   <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>
                   <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    360° View
                   </div>
                </div>
            ) : (
              <img 
                src={item.url} 
                alt={item.description} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
              />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
              <p className="text-xs text-white font-medium truncate">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10">
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white z-50"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-4">
             {selectedMedia.type === 'video' ? (
               <video 
                controls 
                autoPlay 
                className="w-full h-auto max-h-[80vh] rounded-lg shadow-2xl border border-slate-800"
                src={selectedMedia.url}
               />
             ) : selectedMedia.type === '360' ? (
                <div className="w-full h-[70vh] relative rounded-lg overflow-hidden border border-slate-800 bg-black group">
                    {/* Simulated 360 Viewer */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                         <div className="glass-panel px-4 py-2 rounded-full text-sm text-white flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Drag to Look Around
                         </div>
                    </div>
                    <img 
                        src={selectedMedia.url} 
                        alt="360 view"
                        className="w-full h-full object-cover scale-125 cursor-move"
                        style={{ objectPosition: 'center' }}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-500">360° Simulated View</div>
                </div>
             ) : (
               <img 
                src={selectedMedia.url} 
                alt={selectedMedia.description}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
               />
             )}
             <div className="text-center mt-4">
               <p className="text-lg font-medium text-white">{selectedMedia.description}</p>
               {selectedMedia.type === '360' && <p className="text-slate-400 text-sm">Immersive Interior View</p>}
             </div>
          </div>
        </div>
      )}
    </>
  );
};