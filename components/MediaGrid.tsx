
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  media: MediaItem[];
}

type ViewMode = 'tiles' | 'content';
type FilterType = 'all' | 'inside' | 'outside' | 'drone' | 'interior';

// --- Helper Functions ---

const getVideoInfo = (url: string) => {
  if (!url) return { type: 'file', embedUrl: '', thumbnail: null };
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      id: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1], embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`, thumbnail: null };
  return { type: 'file', embedUrl: url, thumbnail: null };
};

const VideoThumbnail: React.FC<{ url: string }> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const info = getVideoInfo(url);

  if (info.type !== 'file') {
     return (
        <div className="w-full h-full relative group bg-slate-900">
          {info.thumbnail && <img src={info.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Video" />}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
             </div>
          </div>
        </div>
     );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
        <video 
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-10 h-10 rounded-full bg-brand-blue/90 flex items-center justify-center pl-1 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
    </div>
  );
};

// --- Advanced Lightbox Component ---

interface LightboxProps {
  media: MediaItem;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ media, onClose }) => {
  // Transformation State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for calculations
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);

  // Lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // --- Handlers ---

  const handleWheel = (e: React.WheelEvent) => {
    if (media.type === 'video') return; // Disable zoom for video
    e.preventDefault();

    const scaleSensitivity = 0.001;
    const delta = -e.deltaY * scaleSensitivity;
    const newScale = Math.min(Math.max(1, scale + delta * scale), 5); // Clamp 1x to 5x

    setScale(newScale);

    if (newScale === 1) {
      setPosition({ x: 0, y: 0 }); // Reset position on full zoom out
    }
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (scale === 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    lastPositionRef.current = { ...position };
  };

  const onDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current || scale === 1) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Boundary Logic
    // We only allow panning if the image is larger than the viewport
    // The max translate is roughly (scaledWidth - viewWidth) / 2
    
    // Simplified boundary for smoothness:
    // Limit x and y based on current scale
    const limitX = (window.innerWidth * scale - window.innerWidth) / 2;
    const limitY = (window.innerHeight * scale - window.innerHeight) / 2;

    let newX = lastPositionRef.current.x + deltaX;
    let newY = lastPositionRef.current.y + deltaY;

    // Clamp
    newX = Math.max(-limitX, Math.min(limitX, newX));
    newY = Math.max(-limitY, Math.min(limitY, newY));

    setPosition({ x: newX, y: newY });
  };

  const endDrag = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // --- Mouse Events ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => onDrag(e.clientX, e.clientY);
  const handleMouseUp = endDrag;

  // --- Touch Events (Pinch & Pan) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      // Pinch Start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      onDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // Pinch Zoom Logic
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - lastTouchDistanceRef.current;
      
      // Update scale based on pinch delta
      // Reduced sensitivity for smoother mobile feel
      const newScale = Math.min(Math.max(1, scale + delta * 0.01), 5);
      setScale(newScale);
      
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    endDrag();
    lastTouchDistanceRef.current = null;
  };

  // Double tap to smart zoom
  const handleDoubleClick = () => {
    if (media.type === 'video') return;
    if (scale > 1) {
        setScale(1);
        setPosition({x: 0, y: 0});
    } else {
        setScale(2.5);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden touch-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* High-Z Exit Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-6 right-6 z-[5100] bg-white/10 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-lg"
        aria-label="Close Lightbox"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Reset Zoom Button (Only visible when zoomed) */}
      {scale > 1 && (
         <button 
            onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
            className="fixed bottom-10 z-[5100] bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md hover:bg-white/20"
         >
            Reset View
         </button>
      )}

      {/* Content Container with Transform */}
      <div 
        ref={contentRef}
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
        style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
         <div className="pointer-events-auto" onDoubleClick={handleDoubleClick}>
            {media.type === 'video' ? (
                // Videos are contained and don't receive zoom transforms directly to preserve controls
                // We wrap it in a static container that ignores the parent scale if needed, 
                // but here we scale the container. Note: Native controls might be hard to hit if scaled too much.
                (() => {
                    const info = getVideoInfo(media.url);
                    return info.type === 'file' 
                    ? <video controls autoPlay playsInline className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl" src={media.url} />
                    : <iframe src={info.embedUrl} className="w-[85vw] aspect-video max-h-[85vh] rounded-lg shadow-2xl" allow="autoplay; encrypted-media" allowFullScreen />
                })()
            ) : (
                <img 
                    src={media.url} 
                    alt={media.description} 
                    className="max-w-[95vw] max-h-[95vh] object-contain select-none shadow-2xl rounded-sm"
                    draggable={false}
                />
            )}
         </div>
      </div>

      {/* Caption Overlay - Fades out when zoomed to focus on details */}
      <div className={`fixed bottom-0 left-0 right-0 p-8 text-center pointer-events-none transition-opacity duration-300 ${scale > 1.1 ? 'opacity-0' : 'opacity-100'}`}>
          <div className="inline-block bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 max-w-xl">
            <h4 className="text-base font-bold text-white mb-1">{media.description}</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{media.category} • {media.type}</p>
          </div>
      </div>
    </div>
  );
};

// --- Main MediaGrid Component ---

export const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'photos'>('all');

  const filteredMedia = useMemo(() => {
    let list = [...media];
    if (activeFilter !== 'all') list = list.filter(m => m.category === activeFilter);
    if (activeTab === 'videos') list = list.filter(m => m.type === 'video');
    else if (activeTab === 'photos') list = list.filter(m => m.type === 'photo' || m.type === '360');
    return list;
  }, [media, activeFilter, activeTab]);

  const categories: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'outside', label: 'Outside' },
    { id: 'inside', label: 'Inside' },
    { id: 'drone', label: 'Drone' },
    { id: 'interior', label: 'Finishing' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
            {(['all', 'videos', 'photos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
             <button onClick={() => setViewMode('tiles')} className={`flex-1 p-2 rounded-xl transition-colors ${viewMode === 'tiles' ? 'bg-slate-800 text-brand-blue' : 'text-slate-600'}`}>
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
             </button>
             <button onClick={() => setViewMode('content')} className={`flex-1 p-2 rounded-xl transition-colors ${viewMode === 'content' ? 'bg-slate-800 text-brand-blue' : 'text-slate-600'}`}>
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
          </div>
        </div>

        {/* Filter Scrollable Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                activeFilter === cat.id 
                  ? 'bg-white text-brand-dark border-white' 
                  : 'bg-white/5 text-slate-400 border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Display */}
      {filteredMedia.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-600">
          No footage found in this category.
        </div>
      ) : (
        <div className={viewMode === 'tiles' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6" 
          : "flex flex-col gap-10 max-w-4xl mx-auto"
        }>
          {filteredMedia.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className={`group relative bg-slate-900 rounded-3xl overflow-hidden cursor-pointer border border-white/5 transition-all active:scale-[0.97] ${
                viewMode === 'content' ? 'aspect-video' : 'aspect-square md:aspect-[4/3]'
              }`}
            >
              {item.type === 'video' ? (
                <VideoThumbnail url={item.url} />
              ) : (
                <img src={item.url} alt={item.description} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <p className="text-xs text-white font-medium line-clamp-2">{item.description}</p>
                  <span className="text-[9px] font-bold text-brand-blue uppercase mt-2">{item.category}</span>
              </div>
              
              {/* Category Badge for Static Tile */}
              {viewMode === 'tiles' && (
                <div className="absolute top-3 right-3">
                  <span className="bg-black/40 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-bold text-white/80 uppercase tracking-tighter border border-white/5">
                    {item.category || 'Footage'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Render the advanced Lightbox if media is selected */}
      {selectedMedia && (
        <Lightbox media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}
    </div>
  );
};
