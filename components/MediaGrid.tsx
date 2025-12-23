
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  media: MediaItem[];
}

type ViewMode = 'tiles' | 'content';
type FilterType = 'all' | 'inside' | 'outside' | 'drone' | 'interior';

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

const VideoThumbnail: React.FC<{ url: string; autoPlayOnHover?: boolean }> = ({ url, autoPlayOnHover = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const info = getVideoInfo(url);

  const handleMouseEnter = () => {
    if (autoPlayOnHover && videoRef.current && info.type === 'file') {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (autoPlayOnHover && videoRef.current && info.type === 'file') {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (info.type !== 'file') {
     return (
        <div className="w-full h-full relative group">
          {info.thumbnail ? (
              <img src={info.thumbnail} alt="Video" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">{info.type}</span>
              </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
             </div>
          </div>
        </div>
     );
  }

  return (
    <div className="w-full h-full relative overflow-hidden" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <video 
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover transition-opacity"
            muted
            loop
            playsInline
            preload="metadata"
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-brand-blue/90 flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
    </div>
  );
};

export const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'photos'>('all');

  // Filtering Logic
  const filteredMedia = useMemo(() => {
    let list = [...media];
    if (activeFilter !== 'all') {
      list = list.filter(m => m.category === activeFilter);
    }
    if (activeTab === 'videos') {
      list = list.filter(m => m.type === 'video');
    } else if (activeTab === 'photos') {
      list = list.filter(m => m.type === 'photo' || m.type === '360');
    }
    return list;
  }, [media, activeFilter, activeTab]);

  const stats = useMemo(() => ({
    videos: media.filter(m => m.type === 'video').length,
    photos: media.filter(m => m.type === 'photo' || m.type === '360').length
  }), [media]);

  const categories: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Areas' },
    { id: 'outside', label: 'Outside' },
    { id: 'inside', label: 'Inside' },
    { id: 'drone', label: 'Drone' },
    { id: 'interior', label: 'Interior' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between bg-slate-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
        {/* Type Tabs */}
        <div className="flex bg-slate-950/50 p-1 rounded-xl">
          {(['all', 'videos', 'photos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-brand-blue text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-slate-800'}`}>
                {tab === 'all' ? media.length : tab === 'videos' ? stats.videos : stats.photos}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-950/50 p-1 rounded-xl">
            <button onClick={() => setViewMode('tiles')} className={`p-2 rounded-lg transition-colors ${viewMode === 'tiles' ? 'bg-slate-800 text-brand-blue' : 'text-slate-600 hover:text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode('content')} className={`p-2 rounded-lg transition-colors ${viewMode === 'content' ? 'bg-slate-800 text-brand-blue' : 'text-slate-600 hover:text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips (Horizontal Scroll on Mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              activeFilter === cat.id 
                ? 'bg-white text-brand-dark border-white' 
                : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Media Display */}
      {filteredMedia.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl text-slate-600">
          No media matches your current filter.
        </div>
      ) : (
        <div className={viewMode === 'tiles' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" 
          : "flex flex-col gap-8 max-w-4xl mx-auto"
        }>
          {filteredMedia.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className={`group relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-white/5 transition-all hover:border-brand-blue/50 active:scale-[0.98] ${
                viewMode === 'content' ? 'aspect-video md:aspect-[21/9]' : 'aspect-square md:aspect-video'
              }`}
            >
              {item.type === 'video' ? (
                <VideoThumbnail url={item.url} />
              ) : (
                <div className="w-full h-full relative">
                  <img src={item.url} alt={item.description} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  {item.type === '360' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tag Overlays */}
              <div className="absolute top-2 left-2 flex gap-1">
                {item.category && (
                  <span className="bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] uppercase font-bold text-white tracking-widest border border-white/10">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Info Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-transform duration-300 ${
                viewMode === 'tiles' ? 'translate-y-full group-hover:translate-y-0' : 'translate-y-0'
              }`}>
                <p className="text-xs text-white font-medium truncate drop-shadow-lg">{item.description}</p>
                {viewMode === 'content' && item.type === 'video' && (
                  <span className="text-[10px] text-brand-blue font-bold uppercase mt-1 inline-block">Click to play full video</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Overlay (Enhanced Mobile Support) */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-all active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="w-full h-full flex flex-col p-4 md:p-12 relative">
             <div className="flex-1 flex items-center justify-center relative">
                {/* Side Navigation Buttons (Desktop) */}
                <div className="hidden md:contents">
                   <button className="absolute left-4 p-4 text-white/20 hover:text-white transition-all"><svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                   <button className="absolute right-4 p-4 text-white/20 hover:text-white transition-all"><svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>

                {selectedMedia.type === 'video' ? (
                  (() => {
                    const info = getVideoInfo(selectedMedia.url);
                    return info.type === 'file' ? (
                      <video controls autoPlay playsInline className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" src={selectedMedia.url} />
                    ) : (
                      <iframe src={info.embedUrl} className="w-full aspect-video max-h-[75vh] rounded-lg shadow-2xl" allow="autoplay; encrypted-media" allowFullScreen />
                    );
                  })()
                ) : (
                  <img src={selectedMedia.url} alt={selectedMedia.description} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none" />
                )}
             </div>

             <div className="text-center mt-6">
                <h4 className="text-lg font-bold text-white mb-1">{selectedMedia.description}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
                    {selectedMedia.type}
                  </span>
                  {selectedMedia.category && (
                     <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest bg-brand-blue/10 px-2 py-1 rounded border border-brand-blue/20">
                      {selectedMedia.category}
                    </span>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
