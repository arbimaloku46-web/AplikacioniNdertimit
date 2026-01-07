
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  media: MediaItem[];
}

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

// --- Components ---

const VideoIndicator = () => (
  <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
      <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
  </div>
);

const VideoDuration = () => (
    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-medium text-white">
        Video
    </div>
);

// --- Advanced Lightbox Component ---

interface LightboxProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ items, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Transformation State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  const currentMedia = items[currentIndex];

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]); // Re-bind when index changes to keep closure fresh if needed, though functional updates handle it.

  // --- Navigation Logic ---

  const nextSlide = useCallback(() => {
    resetZoom();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    resetZoom();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const resetZoom = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
  };

  // --- Zoom & Pan Logic ---

  const handleWheel = (e: React.WheelEvent) => {
    if (currentMedia.type === 'video') return; 
    e.preventDefault();
    const scaleSensitivity = 0.001;
    const delta = -e.deltaY * scaleSensitivity;
    const newScale = Math.min(Math.max(1, scale + delta * scale), 5); // Clamp 1x to 5x
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (scale === 1) return; // Allow normal swipe if not zoomed
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    lastPositionRef.current = { ...position };
  };

  const onDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current || scale === 1) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    
    // Simple boundary calc
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

  // --- Touch Logic (Swipe vs Pan) ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (scale > 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
       if (scale > 1) {
           onDrag(e.touches[0].clientX, e.touches[0].clientY);
       }
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // Pinch Zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - lastTouchDistanceRef.current;
      const newScale = Math.min(Math.max(1, scale + delta * 0.01), 5);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Check for Swipe if not zoomed
    if (scale === 1 && touchStartRef.current) {
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartRef.current.x - touchEndX;
        
        // Threshold for swipe
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) nextSlide(); // Swipe Left -> Next
            else prevSlide(); // Swipe Right -> Prev
        }
    }

    endDrag();
    lastTouchDistanceRef.current = null;
    touchStartRef.current = null;
  };

  const handleDoubleClick = () => {
    if (currentMedia.type === 'video') return;
    if (scale > 1) {
        setScale(1);
        setPosition({x: 0, y: 0});
    } else {
        setScale(2.5);
    }
  };

  // --- Render ---

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden touch-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* --- UI Controls Layer (Z-50) --- */}
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[110] bg-gradient-to-b from-black/80 to-transparent">
         <span className="text-white font-medium text-sm drop-shadow-md">
             {currentIndex + 1} of {items.length}
         </span>
         <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
         >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>
      </div>

      {/* Navigation Arrows (Desktop) */}
      <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md z-[110] transition-all">
         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md z-[110] transition-all">
         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Footer Info */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-[110] transition-opacity duration-300 ${scale > 1.1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         <h3 className="text-white font-bold text-lg">{currentMedia.description}</h3>
         <p className="text-slate-300 text-xs uppercase tracking-widest mt-1">{currentMedia.category} • {currentMedia.type}</p>
      </div>

      {/* --- Content Layer --- */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => onDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
         <div className="w-full h-full flex items-center justify-center" onDoubleClick={handleDoubleClick}>
            {currentMedia.type === 'video' ? (
                (() => {
                    const info = getVideoInfo(currentMedia.url);
                    return info.type === 'file' 
                    ? <video controls autoPlay playsInline className="max-w-full max-h-full object-contain" src={currentMedia.url} />
                    : <iframe src={info.embedUrl} className="w-full aspect-video max-h-[80vh] shadow-2xl pointer-events-auto" allow="autoplay; encrypted-media" allowFullScreen />
                })()
            ) : (
                <img 
                    src={currentMedia.url} 
                    alt={currentMedia.description} 
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                />
            )}
         </div>
      </div>

    </div>
  );
};

// --- Main MediaGrid Component ---

export const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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

      {/* Native Grid View (iOS Style) */}
      {filteredMedia.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-600">
          No footage found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-1 bg-slate-950/50 rounded-xl overflow-hidden p-0.5">
          {filteredMedia.map((item, index) => {
             const isVideo = item.type === 'video';
             // Generate thumbnail url or use image url
             const vidInfo = isVideo ? getVideoInfo(item.url) : null;
             const thumbUrl = isVideo && vidInfo?.thumbnail ? vidInfo.thumbnail : item.url;

             return (
                <div 
                  key={item.id}
                  onClick={() => setLightboxIndex(index)}
                  className="relative aspect-square cursor-pointer group overflow-hidden bg-slate-900"
                >
                  <img 
                    src={thumbUrl} 
                    alt={item.description}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Video Overlays */}
                  {isVideo && (
                    <>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                        <VideoIndicator />
                        <VideoDuration />
                    </>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
             );
          })}
        </div>
      )}

      {/* Render the advanced Lightbox if index is selected */}
      {lightboxIndex !== null && (
        <Lightbox 
            items={filteredMedia} 
            initialIndex={lightboxIndex} 
            onClose={() => setLightboxIndex(null)} 
        />
      )}
    </div>
  );
};
