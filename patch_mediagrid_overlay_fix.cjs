const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf8');

const subComponent = `
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
                    className={\`w-full h-full relative z-10 \${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}\`}
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
`;

if (!code.includes('function CustomVideoSlide')) {
    code = code.replace(/import React.*?from 'react';/, match => match + "\\nimport { Button } from './Button';\\n" + subComponent + "\\n");
    fs.writeFileSync('components/MediaGrid.tsx', code);
    console.log('Fixed CustomVideoSlide injection');
} else {
    console.log('CustomVideoSlide already exists');
}
