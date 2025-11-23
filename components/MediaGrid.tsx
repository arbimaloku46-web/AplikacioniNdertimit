import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  media: MediaItem[];
}

// Internal component to handle complex zoom/pan logic
const ZoomableImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset position if fully zoomed out
      return newScale;
    });
  };
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  };

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setScale(s => Math.min(s + 0.2, 4));
    } else {
      setScale(s => {
        const newScale = Math.max(s - 0.2, 1);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
    }
  };

  // Pointer Events for Panning (Mouse & Touch)
  const onPointerDown = (e: React.PointerEvent) => {
    if (scale === 1) return; // Only drag if zoomed in
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastPositionRef.current = { ...position };
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setPosition({
      x: lastPositionRef.current.x + deltaX,
      y: lastPositionRef.current.y + deltaY
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/50 rounded-lg border border-slate-800">
      {/* Floating Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleZoomOut} disabled={scale <= 1} className="p-2 text-white hover:text-brand-blue disabled:opacity-30 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <span className="text-xs font-mono text-slate-300 w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} disabled={scale >= 4} className="p-2 text-white hover:text-brand-blue disabled:opacity-30 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
        <button onClick={handleReset} className="text-xs font-bold text-slate-400 hover:text-white px-2 uppercase tracking-wider">
          Reset
        </button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center touch-none ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={handleDoubleTap}
      >
        <img 
          src={src} 
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain transition-transform duration-75 ease-linear select-none"
          style={{ 
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

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
            className="absolute top-6 right-6 text-slate-400 hover:text-white z-50 bg-black/20 rounded-full p-1 hover:bg-white/10 transition-colors"
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
               <ZoomableImage src={selectedMedia.url} alt={selectedMedia.description} />
             )}
             <div className="text-center mt-4 relative z-40 pointer-events-none">
               <p className="text-lg font-medium text-white drop-shadow-md">{selectedMedia.description}</p>
               {selectedMedia.type === '360' && <p className="text-slate-400 text-sm">Immersive Interior View</p>}
             </div>
          </div>
        </div>
      )}
    </>
  );
};
