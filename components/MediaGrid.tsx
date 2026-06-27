
import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem } from '../types';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface MediaGridProps {
  media: MediaItem[];
  onFullScreenChange?: (isFullScreen: boolean) => void;
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

// --- Main MediaGrid Component ---

export const MediaGrid: React.FC<MediaGridProps> = ({ media, onFullScreenChange }) => {
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
      <Lightbox
        open={lightboxIndex !== null}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex || 0}
        plugins={[Captions, Video, Zoom]}
        slides={filteredMedia.map(item => {
          if (item.type === 'video') {
            const info = getVideoInfo(item.url);
            if (info.type === 'youtube' || info.type === 'vimeo') {
                return {
                    type: "custom-video",
                    embedUrl: info.embedUrl,
                    title: item.description,
                    description: `${item.category} • ${item.type}`,
                };
            }
            return {
                type: "video",
                width: 1280,
                height: 720,
                poster: "",
                sources: [
                    { src: item.url, type: "video/mp4" }
                ],
                title: item.description,
                description: `${item.category} • ${item.type}`,
            };
          }
          return { 
            src: item.url,
            title: item.description,
            description: `${item.category} • ${item.type}`,
          };
        })}
        render={{
            slide: ({ slide }) => {
                if (slide.type === "custom-video") {
                    return (
                        <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
                            <iframe 
                                src={slide.embedUrl} 
                                className="w-full aspect-video max-h-[80vh] shadow-2xl" 
                                allow="autoplay; encrypted-media" 
                                allowFullScreen 
                            />
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
