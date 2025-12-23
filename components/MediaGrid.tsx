
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
      {/* Controls Bar - Mobile Optimized */}
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

      {/* Lightbox */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 z-[1100] bg-white/10 p-3 rounded-full backdrop-blur-md text-white transition-all active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="w-full max-w-6xl max-h-[85vh] flex items-center justify-center">
            {selectedMedia.type === 'video' ? (
              (() => {
                const info = getVideoInfo(selectedMedia.url);
                return info.type === 'file' 
                  ? <video controls autoPlay playsInline className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" src={selectedMedia.url} />
                  : <iframe src={info.embedUrl} className="w-full aspect-video max-h-[75vh] rounded-2xl shadow-2xl" allow="autoplay; encrypted-media" allowFullScreen />
              })()
            ) : (
              <img src={selectedMedia.url} alt={selectedMedia.description} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            )}
          </div>
          
          <div className="mt-8 text-center max-w-2xl">
              <h4 className="text-lg font-bold text-white mb-2">{selectedMedia.description}</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{selectedMedia.category} • {selectedMedia.type}</p>
          </div>
        </div>
      )}
    </div>
  );
};
