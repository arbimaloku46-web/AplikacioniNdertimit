const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

// Update gap
code = code.replace(/const gap = columns >= 4 \? 4 : 2;/, 'const gap = width < 768 ? 1 : 2;');
code = code.replace(/bg-slate-950\/50 rounded-2xl p-0.5 no-scrollbar/, 'bg-slate-950/50 no-scrollbar');

// Remove rounded-lg from items
code = code.replace(/className=\{\`relative cursor-pointer group overflow-hidden bg-slate-900\/90 backdrop-blur-2xl rounded-lg transition-transform/g, "className={`relative cursor-pointer group overflow-hidden bg-slate-900/90 backdrop-blur-2xl transition-transform");

// Fix video rendering
const videoReplacement = `{isVideo && !vidInfo?.thumbnail ? (
                                            <video 
                                                src={item.url}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                                preload="metadata"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img 
                                                 src={thumbUrl} 
                                                 alt={item.description}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        )}`;

code = code.replace(/<img[\s\S]*?decoding="async"\s*\/>/, videoReplacement);

fs.writeFileSync('components/MediaGrid.tsx', code);
