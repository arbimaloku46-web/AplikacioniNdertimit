const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

// 1. Remove zoomLevel state
code = code.replace(
  "  const [zoomLevel, setZoomLevel] = useState(1);\n",
  ""
);

// 2. Fix zoom styling
code = code.replace(
  `            <div 
              className="flex items-center justify-center p-4 md:p-8 transition-all duration-300 origin-center"
              style={{ 
                minWidth: '100%', 
                minHeight: '100%',
                width: zoomLevel > 1 ? \`\${100 * zoomLevel}%\` : '100%',
                height: zoomLevel > 1 ? \`\${100 * zoomLevel}%\` : '100%'
              }}
            >`,
  `            <div 
              className="flex items-center justify-center p-4 md:p-8 transition-all duration-300 origin-center w-full h-full"
            >`
);

// 3. Remove zoom controls
code = code.replace(
  `            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl z-20">
              <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))} className="p-2 text-white hover:bg-white/10 rounded-lg"><Minus className="w-4 h-4" /></button>
              <span className="text-white text-xs font-bold w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))} className="p-2 text-white hover:bg-white/10 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>`,
  ``
);

// 4. Fix handleImageClick
const oldHandleClick = `  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || mode === 'idle') return;
    const x = (e.nativeEvent.offsetX / imgRef.current.clientWidth) * 100;
    const y = (e.nativeEvent.offsetY / imgRef.current.clientHeight) * 100;
    setPoints([...points, { x, y }]);
  };`;

const newHandleClick = `  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || mode === 'idle') return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints([...points, { x, y }]);
  };`;

code = code.replace(oldHandleClick, newHandleClick);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Fixed Zoom and Point Click Issues');
