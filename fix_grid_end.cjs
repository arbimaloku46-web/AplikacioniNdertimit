const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

const regex = /render=\{\{\s*slide: \(\{ slide \}\) => \{.*?\}\s*\}\}\s*\/>\s*<\/div>\s*\);\s*\};\s*export default MediaGrid;[\s\S]*/s;

const replacement = `render={{
            slide: ({ slide }) => {
                const mediaItem = media.find(m => m.id === (slide as any).mediaId);
                
                if ((slide as any).type === "custom-video") {
                    return (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="relative w-full h-[90vh] md:h-screen flex items-center justify-center">
                                <iframe 
                                     src={(slide as any).embedUrl}
                                     className="w-full h-full relative z-10"
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

export default MediaGrid;
`;

code = code.replace(regex, replacement);

fs.writeFileSync('components/MediaGrid.tsx', code);
