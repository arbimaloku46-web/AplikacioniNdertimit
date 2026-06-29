
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from "motion/react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { MediaItem, Hotspot } from '../types';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface MediaGridProps {
  media: MediaItem[];
  onFullScreenChange?: (isFullScreen: boolean) => void;
  isAdmin?: boolean;
  onMediaUpdate?: (mediaId: string, updatedMedia: MediaItem) => void;
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

// --- Hotspot Components ---

const HotspotEditorOverlay: React.FC<{
  mediaItem: MediaItem;
  isAdmin?: boolean;
  onUpdate?: (updated: MediaItem) => void;
}> = ({ mediaItem, isAdmin, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<Partial<Hotspot> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hotspots = mediaItem.hotspots || [];

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isAdmin || !isEditing) {
      setActiveHotspot(null);
      return;
    }
    
    if (editingHotspot) return; // Currently editing one

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setEditingHotspot({
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      title: '',
      description: '',
      status: 'pending'
    });
  };

  const saveHotspot = () => {
    if (!editingHotspot || !editingHotspot.title || !onUpdate) return;
    
    const isExisting = hotspots.some(h => h.id === editingHotspot.id);
    const newHotspots = isExisting 
      ? hotspots.map(h => h.id === editingHotspot.id ? (editingHotspot as Hotspot) : h)
      : [...hotspots, (editingHotspot as Hotspot)];
      
    onUpdate({ ...mediaItem, hotspots: newHotspots });
    setEditingHotspot(null);
  };

  const deleteHotspot = (id: string) => {
    if (!onUpdate) return;
    onUpdate({ ...mediaItem, hotspots: hotspots.filter(h => h.id !== id) });
    setEditingHotspot(null);
    setActiveHotspot(null);
  };

  return (
    <div 
        ref={containerRef} 
        className="absolute inset-0 z-[120]"
        onClick={handleImageClick}
        style={{ cursor: isEditing ? 'crosshair' : 'default' }}
    >
        {isAdmin && (
            <div className="absolute top-4 right-4 z-[130]">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); setEditingHotspot(null); setActiveHotspot(null); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white shadow-lg'}`}
                >
                    {isEditing ? 'Done' : 'Add Hotspots'}
                </button>
            </div>
        )}

        {hotspots.map(hotspot => (
            <div 
                key={hotspot.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isEditing) {
                        setEditingHotspot(hotspot);
                    } else {
                        setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
                    }
                }}
            >
                <div className={`w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 ${hotspot.status === 'completed' ? 'bg-emerald-500/50' : hotspot.status === 'in-progress' ? 'bg-amber-500/50' : 'bg-brand-blue/50'}`}>
                    <div className="w-2 h-2 bg-white/70 rounded-full" />
                </div>

                {/* Info Card */}
                {activeHotspot?.id === hotspot.id && !isEditing && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-xl p-4 w-64 shadow-2xl z-[150] cursor-default" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold text-sm">{hotspot.title}</h4>
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${hotspot.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : hotspot.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-blue/20 text-brand-blue'}`}>
                                {hotspot.status}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs">{hotspot.description}</p>
                    </div>
                )}
            </div>
        ))}

        {/* Editing Modal */}
        {editingHotspot && (
            <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 rounded-xl p-4 w-72 shadow-2xl z-[150]"
                style={{ left: `${editingHotspot.x}%`, top: `${editingHotspot.y}%` }}
                onClick={e => e.stopPropagation()}
            >
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Edit Hotspot</h4>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Title (e.g. HVAC Installation)" 
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        value={editingHotspot.title || ''}
                        onChange={e => setEditingHotspot({...editingHotspot, title: e.target.value})}
                    />
                    <textarea 
                        placeholder="Details or materials used..." 
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none h-20"
                        value={editingHotspot.description || ''}
                        onChange={e => setEditingHotspot({...editingHotspot, description: e.target.value})}
                    />
                    <select 
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        value={editingHotspot.status || 'pending'}
                        onChange={e => setEditingHotspot({...editingHotspot, status: e.target.value as any})}
                    >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <div className="flex gap-2 pt-2">
                        <button onClick={saveHotspot} className="flex-1 bg-brand-blue text-white text-xs font-bold py-2 rounded-lg">Save</button>
                        <button onClick={() => setEditingHotspot(null)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                    {editingHotspot.id && (
                        <button onClick={() => deleteHotspot(editingHotspot.id!)} className="w-full text-red-400 text-xs font-bold mt-2 hover:underline">Delete Hotspot</button>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};


// --- Main MediaGrid Component ---

export const MediaGrid: React.FC<MediaGridProps> = ({ media, onFullScreenChange, isAdmin, onMediaUpdate }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'photos'>('all');

  // Trigger parent full screen state
  useEffect(() => {
    if (onFullScreenChange) {
        onFullScreenChange(lightboxIndex !== null);
    }
  }, [lightboxIndex, onFullScreenChange]);

  const filteredMedia = useMemo(() => {
    let list = [...media];
    if (activeFilter !== 'all') list = list.filter(m => m.category === activeFilter);
    if (activeTab === 'videos') list = list.filter(m => m.type === 'video');
    else if (activeTab === 'photos') list = list.filter(m => m.type === 'photo' || m.type === '360');
    return list;
  }, [media, activeFilter, activeTab]);

  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
        if (width >= 1024) setColumns(5);
        else if (width >= 768) setColumns(4);
        else setColumns(3);
      }
    });
    if (parentRef.current) observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, []);

  const gap = columns >= 4 ? 4 : 2;
  const itemSize = containerWidth > 0 ? (containerWidth - (columns - 1) * gap) / columns : 150;

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredMedia.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize + gap,
    overscan: 2,
  });

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
        <div ref={parentRef} className="h-[60vh] max-h-[600px] overflow-y-auto bg-slate-950/50 rounded-xl p-0.5 no-scrollbar">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * columns;
                    const rowItems = filteredMedia.slice(startIndex, startIndex + columns);

                    return (
                        <div
                            key={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${itemSize}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                display: 'flex',
                                gap: `${gap}px`
                            }}
                        >
                            {rowItems.map((item, colIndex) => {
                                const index = startIndex + colIndex;
                                const isVideo = item.type === 'video';
                                const vidInfo = isVideo ? getVideoInfo(item.url) : null;
                                const thumbUrl = isVideo && vidInfo?.thumbnail ? vidInfo.thumbnail : item.url;

                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => setLightboxIndex(index)}
                                        style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                                        className="relative cursor-pointer group overflow-hidden bg-slate-900 rounded-lg"
                                    >
                                        <img 
                                            src={thumbUrl} 
                                            alt={item.description}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {isVideo && (
                                            <>
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                                <VideoIndicator />
                                                <VideoDuration />
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* Render the advanced Lightbox if index is selected */}
      <Lightbox
        open={lightboxIndex !== null}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex || 0}
        plugins={[Captions, Video, Zoom]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5, supports: ["custom-image"] }}
        slides={filteredMedia.map(item => {
          const baseProps = {
            mediaId: item.id,
            title: item.description,
            description: `${item.category} • ${item.type}`,
          };
          
          if (item.type === 'video') {
            const info = getVideoInfo(item.url);
            if (info.type === 'youtube' || info.type === 'vimeo') {
                return {
                    ...baseProps,
                    type: "custom-video",
                    embedUrl: info.embedUrl,
                };
            }
            return {
                ...baseProps,
                type: "video",
                width: 1280,
                height: 720,
                poster: "",
                sources: [
                    { src: item.url, type: "video/mp4" }
                ],
            };
          }
          return { 
            ...baseProps,
            type: "custom-image", // Override default image type
            src: item.url,
          };
        })}
        render={{
            slide: ({ slide }) => {
                const mediaItem = media.find(m => m.id === (slide as any).mediaId);

                if (slide.type === "custom-video") {
                    return (
                        <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
                            <div className="relative w-full max-w-[1280px] aspect-video max-h-[80vh] shadow-2xl">
                                <iframe 
                                    src={(slide as any).embedUrl} 
                                    className="w-full h-full relative z-10" 
                                    allow="autoplay; encrypted-media" 
                                    allowFullScreen 
                                />
                                {mediaItem && (
                                    <HotspotEditorOverlay mediaItem={mediaItem} isAdmin={isAdmin} onUpdate={updated => onMediaUpdate && onMediaUpdate(updated.id, updated)} />
                                )}
                            </div>
                        </div>
                    );
                }

                if (slide.type === "custom-image") {
                    return (
                        <div className="relative inline-flex items-center justify-center max-w-full max-h-full shadow-2xl">
                            <img 
                                src={(slide as any).src} 
                                alt={slide.title} 
                                className="max-w-full max-h-[80vh] w-auto h-auto object-contain pointer-events-none" 
                                draggable={false}
                            />
                            {mediaItem && (
                                <HotspotEditorOverlay mediaItem={mediaItem} isAdmin={isAdmin} onUpdate={updated => onMediaUpdate && onMediaUpdate(updated.id, updated)} />
                            )}
                        </div>
                    );
                }
                
                // Fallback for native videos (using container wrapper)
                if (slide.type === "video") {
                     return (
                        <div className="w-full h-full flex items-center justify-center p-4 md:p-12 relative">
                             <div className="relative max-w-full max-h-full inline-block flex items-center justify-center">
                                 <video 
                                     controls 
                                     autoPlay 
                                     playsInline 
                                     className="max-w-full max-h-[80vh] object-contain shadow-2xl relative z-10" 
                                     src={(slide as any).sources[0].src} 
                                 />
                                 {mediaItem && (
                                    <HotspotEditorOverlay mediaItem={mediaItem} isAdmin={isAdmin} onUpdate={updated => onMediaUpdate && onMediaUpdate(updated.id, updated)} />
                                 )}
                             </div>
                        </div>
                     );
                }

                return undefined;
            }
        }}
      />
    </div>
  );
};
