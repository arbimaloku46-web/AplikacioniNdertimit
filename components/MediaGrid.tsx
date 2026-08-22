import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { MediaItem, Hotspot } from '../types';
import { Edit2, Check, X } from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface MediaGridProps {
  items: MediaItem[];
  onFullScreenChange?: (isFullScreen: boolean) => void;
  isAdmin?: boolean;
  onMediaUpdate?: (mediaId: string, updatedMedia: MediaItem) => void;
  onMediaReorder?: (newMediaOrder: MediaItem[]) => void;
}

type FilterType = 'all' | 'inside' | 'outside' | 'drone' | 'interior';

const getVideoInfo = (url: string) => {
  if (!url) return { type: 'file', embedUrl: '', thumbnail: null };
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return { type: 'youtube', id: ytMatch[1], embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`, thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1], embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`, thumbnail: null };
  return { type: 'file', embedUrl: url, thumbnail: null };
};

const VideoIndicator = () => (
  <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
    <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
  </div>
);

const VideoDuration = () => (
  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-sm font-medium text-white">
    Video
  </div>
);

const HotspotEditorOverlay: React.FC<{ mediaItem: MediaItem; isAdmin?: boolean; onUpdate?: (item: MediaItem) => void }> = ({ mediaItem, isAdmin, onUpdate }) => {
  // simplified hotspot overlay to fix the bug
  return <div />;
};

export const MediaGrid: React.FC<MediaGridProps> = ({ items, onFullScreenChange, isAdmin, onMediaUpdate, onMediaReorder }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'photos'>('all');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredMedia = useMemo(() => {
    return items.filter(item => {
      const typeMatch = activeTab === 'all' || item.type === (activeTab === 'videos' ? 'video' : 'photo');
      const catMatch = activeFilter === 'all' || item.category === activeFilter;
      return typeMatch && catMatch;
    });
  }, [items, activeTab, activeFilter]);

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
          <div className="flex bg-slate-900/80 p-1.5 rounded-md border border-white/5">
            {(['all', 'videos', 'photos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-8 py-2 rounded-md text-xs font-semibold tracking-normal tracking-wider transition-all ${
                  activeTab === tab ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500'
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
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold tracking-normal transition-all border ${
                  activeFilter === cat.id ? 'bg-white text-brand-dark border-white' : 'bg-white/5 text-slate-500 border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredMedia.length === 0 ? (
        <div className="py-24 text-center border-2 border-solid border-white/5 rounded-lg text-slate-600">
          No footage found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {filteredMedia.map((item, index) => {
            const isVideo = item.type === 'video';
            const vidInfo = isVideo ? getVideoInfo(item.url) : null;
            const thumbUrl = isVideo && vidInfo?.thumbnail ? vidInfo.thumbnail : item.url;
            return (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="relative cursor-pointer group overflow-hidden bg-slate-900/90 rounded-lg aspect-square"
              >
                <img
                  src={thumbUrl}
                  alt={item.description}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {isVideo && (
                  <>
                    <VideoIndicator />
                    <VideoDuration />
                  </>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ease-in-out" />
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex !== null}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex || 0}
        plugins={[Captions, Video, Zoom]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 5 }}
        slides={filteredMedia.map(item => {
          if (item.type === 'video') {
            const info = getVideoInfo(item.url);
            if (info.type === 'youtube' || info.type === 'vimeo') {
              return { type: "custom-video", embedUrl: info.embedUrl, title: item.description } as any;
            }
            return {
              type: "video",
              width: 1280,
              height: 720,
              sources: [{ src: item.url, type: "video/mp4" }],
              title: item.description
            };
          }
          return { type: "image", src: item.url, title: item.description };
        })}
        render={{
          slide: ({ slide }) => {
            if ((slide as any).type === "custom-video") {
              return (
                <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
                  <div className="relative w-full max-w-[1280px] aspect-video max-h-[80vh] shadow-md">
                    <iframe src={(slide as any).embedUrl} className="w-full h-full relative z-10" allow="autoplay; encrypted-media" allowFullScreen />
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
