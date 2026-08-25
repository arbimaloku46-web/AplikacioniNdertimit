const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

const hookAddition = `
function ImageWithOverlay({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [bounds, setBounds] = React.useState({ top: 0, left: 0, width: 100, height: 100 });

  const updateBounds = React.useCallback(() => {
    if (imgRef.current && imgRef.current.naturalWidth) {
      const img = imgRef.current;
      const containerRatio = img.offsetWidth / img.offsetHeight;
      const imageRatio = img.naturalWidth / img.naturalHeight;
      let renderedWidth, renderedHeight;
      if (imageRatio > containerRatio) {
         renderedWidth = img.offsetWidth;
         renderedHeight = img.offsetWidth / imageRatio;
      } else {
         renderedHeight = img.offsetHeight;
         renderedWidth = img.offsetHeight * imageRatio;
      }
      setBounds({
         top: (img.offsetHeight - renderedHeight) / 2,
         left: (img.offsetWidth - renderedWidth) / 2,
         width: renderedWidth,
         height: renderedHeight
      });
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  return (
    <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white/5" style={{ lineHeight: 0 }}>
      <img 
        ref={imgRef}
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain rounded-2xl select-none"
        draggable={false}
        onLoad={updateBounds}
      />
      <div className="absolute pointer-events-auto" style={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}>
        {children}
      </div>
    </div>
  );
}
`;

if (!code.includes('function ImageWithOverlay')) {
  code = code.replace("export default function InteractiveViewer({ data }: InteractiveViewerProps) {", hookAddition + "\nexport default function InteractiveViewer({ data }: InteractiveViewerProps) {");
}

// Level 1:
code = code.replace(
  /<div className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl" style=\{\{ lineHeight: 0 \}\}>\s*<img\s*src=\{data\.mainImageUrl\}\s*alt=\{data\.name\}\s*className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"\s*\/>/g,
  '<ImageWithOverlay src={data.mainImageUrl} alt={data.name}>'
);

code = code.replace(
  /\{\/\* Floor Labels Overlay \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/,
  '{/* Floor Labels Overlay */}$1\n                </ImageWithOverlay>\n              </div>\n            </div>'
);

// Level 2:
code = code.replace(
  /<div className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white" style=\{\{ lineHeight: 0 \}\}>\s*<img\s*src=\{activeFloor\.floorPlanUrl\}\s*alt=\{activeFloor\.name\}\s*className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"\s*\/>/g,
  '<ImageWithOverlay src={activeFloor.floorPlanUrl} alt={activeFloor.name}>'
);

code = code.replace(
  /\{\/\* Unit Labels Overlay \*\/\}([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div className="w-full md:w-1\/4 h-\[50vh\] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white\/10 flex flex-col min-w-0 min-h-0">/,
  '{/* Unit Labels Overlay */}$1\n                  </ImageWithOverlay>\n                </div>\n              </div>\n              <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-w-0 min-h-0">'
);

// Level 3 doesn't have SVG overlays, but let's just make it use w-full h-full object-contain
code = code.replace(
  /<div className="relative flex min-h-0 min-w-0 max-w-full max-h-full" style=\{\{ lineHeight: 0 \}\}>\s*<img\s*src=\{activeUnit\.floorPlanUrl\}\s*alt=\{activeUnit\.name\}\s*className="block max-w-full max-h-full w-auto h-auto min-w-0 min-h-0"\s*\/>/g,
  `<div className="relative w-full h-full" style={{ lineHeight: 0 }}>
                  <img src={activeUnit.floorPlanUrl} alt={activeUnit.name} className="w-full h-full object-contain" />`
);


fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Done InteractiveViewer');
