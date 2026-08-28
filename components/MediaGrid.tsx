
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './Button';

function CustomVideoSlide({ slide, mediaItem, isAdmin, onMediaUpdate }: any) {
    const [isInteracting, React_useState] = React.useState(false);
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-[90vh] md:h-screen flex items-center justify-center">
                {!isInteracting && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all duration-300">
                        <Button 
                            onClick={() => React_useState(true)}
                            className="shadow-2xl !bg-white !text-slate-950 hover:scale-105"
                        >
                            Tap to Explore
                        </Button>
                    </div>
                )}
                {isInteracting && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto">
                        <button 
                            onClick={() => React_useState(false)}
                            className="bg-brand-blue/90 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full text-xs font-extrabold tracking-tight uppercase tracking-wider hover:bg-brand-blue shadow-xl transition-all"
                        >
                            Done Exploring
                        </button>
                    </div>
                )}
                <iframe 
                    src={(slide.embedUrl && slide.embedUrl.includes('poly.cam/capture/')) 
                        ? (slide.embedUrl.includes('cookie_consent') ? slide.embedUrl : slide.embedUrl + (slide.embedUrl.includes('?') ? '&' : '?') + 'gdpr=0&cookie_consent=true')
                        : slide.embedUrl} 
                    className={`w-full h-full relative z-10 ${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                    allowFullScreen 
                />
                {mediaItem && (
                    <HotspotEditorOverlay mediaItem={mediaItem} isAdmin={isAdmin} onUpdate={updated => onMediaUpdate && onMediaUpdate(updated.id, updated)} />
                )}
            </div>
        </div>
    );
}


import { motion } from "motion/react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { MediaItem, Hotspot } from '../types';
import { Edit2, Check, X } from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface MediaGridProps {
  media: MediaItem[];
  onFullScreenChange?: (isFullScreen: boolean) => void;
  isAdmin?: boolean;
  onMediaUpdate?: (mediaId: string, updatedMedia: MediaItem) => void;
  onMediaReorder?: (newMediaOrder: MediaItem[]) => void;
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
                    className={`px-6 py-2 rounded-2xl text-xs font-extrabold tracking-tight uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white shadow-lg'}`}
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
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40 rounded-2xl p-6 w-64 shadow-2xl z-[150] cursor-default" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-extrabold tracking-tight text-sm">{hotspot.title}</h4>
                            <span className={`text-[9px] font-extrabold tracking-tight uppercase tracking-widest px-2 py-0.5 rounded-full ${hotspot.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : hotspot.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-blue/20 text-brand-blue'}`}>
                                {hotspot.status}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs">{hotspot.description}</p>
                    </div>
                )}
            </div>
        ))}

        {/* Editing Modal */}
        {editingHotspot && (
            <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40 rounded-2xl p-6 w-72 shadow-2xl z-[150]"
                style={{ left: `${editingHotspot.x}%`, top: `${editingHotspot.y}%` }}
                onClick={e => e.stopPropagation()}
            >
                <h4 className="text-white text-xs font-extrabold tracking-tight uppercase tracking-widest mb-4">Edit Hotspot</h4>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Title (e.g. HVAC Installation)" 
                        className="w-full bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg px-3 py-2 text-xs text-white"
                        value={editingHotspot.title || ''}
                        onChange={e => setEditingHotspot({...editingHotspot, title: e.target.value})}
                    />
                    <textarea 
                        placeholder="Details or materials used..." 
                        className="w-full bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg px-3 py-2 text-xs text-white resize-none h-20"
                        value={editingHotspot.description || ''}
                        onChange={e => setEditingHotspot({...editingHotspot, description: e.target.value})}
                    />
                    <select 
                        className="w-full bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-lg px-3 py-2 text-xs text-white"
                        value={editingHotspot.status || 'pending'}
                        onChange={e => setEditingHotspot({...editingHotspot, status: e.target.value as any})}
                    >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <div className="flex gap-2 pt-2">
                        <button onClick={saveHotspot} className="flex-1 bg-brand-blue text-white text-xs font-extrabold tracking-tight py-2 rounded-lg">Save</button>
                        <button onClick={() => setEditingHotspot(null)} className="flex-1 bg-white/10 text-white text-xs font-extrabold tracking-tight py-2 rounded-lg">Cancel</button>
                    </div>
                    {editingHotspot.id && (
                        <button onClick={() => deleteHotspot(editingHotspot.id!)} className="w-full text-red-400 text-xs font-extrabold tracking-tight mt-2 hover:underline">Delete Hotspot</button>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};


// --- Main MediaGrid Component ---

export const MediaGrid: React.FC<MediaGridProps> = ({ media, onFullScreenChange, isAdmin, onMediaUpdate, onMediaReorder }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'photos'>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  const canReorder = isAdmin && activeFilter === 'all' && activeTab === 'all';

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!canReorder) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canReorder) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!canReorder) return;
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      const draggedIndex = media.findIndex(m => m.id === draggedId);
      const targetIndex = media.findIndex(m => m.id === targetId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newMedia = [...media];
        const [moved] = newMedia.splice(draggedIndex, 1);
        newMedia.splice(targetIndex, 0, moved);
        if (onMediaReorder) onMediaReorder(newMedia);
      }
    }
    setDraggedId(null);
  };

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
            {(['all', 'videos', 'photos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-8 py-2 rounded-2xl text-xs font-extrabold tracking-tight uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-extrabold tracking-tight uppercase tracking-widest transition-all border ${
                    activeFilter === cat.id 
                      ? 'bg-white text-brand-dark border-white' 
                      : 'bg-white/5 text-slate-500 border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {canReorder && (
                <div className="hidden md:flex text-[10px] text-slate-500 uppercase tracking-widest font-extrabold items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9h14M5 15h14" strokeLinecap="round"/></svg>
                    Drag to reorder
                </div>
            )}
        </div>
      </div>

      {/* Native Grid View (iOS Style) */}
      {filteredMedia.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-600">
          No footage found in this category.
        </div>
      ) : (
        <div ref={parentRef} className="h-[60vh] max-h-[600px] overflow-y-auto bg-slate-950/50 rounded-2xl p-0.5 no-scrollbar">
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
                                        onClick={() => {
                                            if (editingCaptionId !== item.id) {
                                                setLightboxIndex(index);
                                            }
                                        }}
                                        draggable={canReorder && editingCaptionId !== item.id}
                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, item.id)}
                                        style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                                        className={`relative cursor-pointer group overflow-hidden bg-slate-900/90 backdrop-blur-2xl rounded-lg transition-transform ${draggedId === item.id ? 'opacity-50 scale-95' : ''} ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    >
                                        <img 
                                            src={thumbUrl} 
                                            alt={item.description}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {isVideo && (
                                            <>
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300 ease-in-out" />
                                                <VideoIndicator />
                                                <VideoDuration />
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ease-in-out" />
                                        
                                        {isAdmin && editingCaptionId !== item.id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCaptionId(item.id);
                                                    setEditCaptionText(item.description || '');
                                                }}
                                                className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {isAdmin && editingCaptionId === item.id && (
                                            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 p-3 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                                                <label className="text-[10px] text-brand-blue uppercase font-extrabold tracking-tight mb-2 block">Edit Caption</label>
                                                <textarea 
                                                    value={editCaptionText}
                                                    onChange={(e) => setEditCaptionText(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2 text-xs text-white resize-none h-16 focus:border-brand-blue focus:outline-none mb-2"
                                                    placeholder="Enter description..."
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button 
                                                        onClick={() => setEditingCaptionId(null)}
                                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (onMediaUpdate) {
                                                                onMediaUpdate(item.id, { ...item, description: editCaptionText });
                                                            }
                                                            setEditingCaptionId(null);
                                                        }}
                                                        className="p-1.5 bg-brand-blue hover:bg-brand-blue/80 rounded-lg text-white transition-colors shadow-lg shadow-brand-blue/20"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
        plugins={[Captions, Video, Zoom, Download]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5, supports: ["custom-image"] }}
        slides={filteredMedia.map(item => {
          const baseProps = {
            mediaId: item.id,
            title: item.description,
            description: `${item.category} • ${item.type}`,
            downloadUrl: item.url,
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
        }) as any}
        render={{
            slide: ({ slide }) => {
                const mediaItem = media.find(m => m.id === (slide as any).mediaId);

                                if ((slide as any).type === "custom-video") {
                    return <CustomVideoSlide slide={slide} mediaItem={mediaItem} isAdmin={isAdmin} onMediaUpdate={onMediaUpdate} />;
                }

                if ((slide as any).type === "custom-image") {
                    return (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                                src={(slide as any).src} 
                                alt={(slide as any).title} 
                                className="w-full h-[90vh] md:h-screen object-contain pointer-events-none" 
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
                        <div className="w-full h-full flex items-center justify-center relative">
                             <div className="relative w-full h-full flex items-center justify-center">
                                 <video 
                                     controls 
                                     autoPlay 
                                     playsInline 
                                     className="w-full h-[90vh] md:h-screen object-contain relative z-10" 
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
