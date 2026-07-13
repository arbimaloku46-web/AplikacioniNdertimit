import React, { useState, useRef } from 'react';
import { X, Undo, Check } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const AdminCoordinateMapper: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [svgPath, setSvgPath] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setPoints([]);
      setSvgPath('');
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    
    // Calculate percentages so it scales responsively
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);
    updateSvgPath(newPoints);
  };

  const updateSvgPath = (pts: Point[]) => {
    if (pts.length === 0) {
      setSvgPath('');
      return;
    }
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';
    setSvgPath(path);
  };

  const undoLastPoint = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    updateSvgPath(newPoints);
  };

  const clearPoints = () => {
    setPoints([]);
    setSvgPath('');
  };

  return (
    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl text-white w-full max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-brand-blue">Admin Coordinate Mapper</h3>
      
      {!image ? (
        <div className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-950">
          <p className="text-slate-400 mb-4 font-medium">Upload a floor plan or building image to start mapping</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-blue file:text-white hover:file:bg-blue-600 cursor-pointer" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 overflow-hidden bg-slate-950 rounded-xl flex items-center justify-center p-4">
            <div className="relative inline-block w-full max-w-full border border-white/10 rounded-lg overflow-hidden cursor-crosshair shadow-2xl">
              <img 
                ref={imgRef}
                src={image} 
                alt="Map Reference" 
                className="w-full h-auto object-contain block select-none"
                draggable={false}
                onClick={handleImageClick}
              />
              <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                {points.length > 0 && (
                  <path 
                    d={svgPath.replace(' Z', '')} 
                    fill="rgba(59, 130, 246, 0.4)" 
                    stroke="#3b82f6" 
                    strokeWidth="0.5" 
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="#fff" stroke="#3b82f6" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
            </div>
          </div>
          
          <div className="w-full lg:w-80 bg-slate-950 p-6 rounded-xl flex flex-col h-fit shrink-0">
            <div className="flex justify-between items-center mb-6">
               <h4 className="font-bold text-slate-200">Coordinates (SVG Path)</h4>
               <div className="flex gap-2">
                 <button onClick={undoLastPoint} disabled={points.length === 0} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors" title="Undo Last Point">
                    <Undo className="w-4 h-4" />
                 </button>
                 <button onClick={clearPoints} disabled={points.length === 0} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg disabled:opacity-50 transition-colors" title="Clear All">
                    <X className="w-4 h-4" />
                 </button>
               </div>
            </div>
            
            <p className="text-xs text-slate-500 mb-2">Click around the perimeter of the floor or unit to draw a polygon. The coordinates are calculated in percentages to ensure responsive scaling.</p>
            
            <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-300 break-all h-32 overflow-y-auto mb-6 border border-white/5 shadow-inner">
              {svgPath || "Click on the image to draw a polygon..."}
            </div>
            
            <button 
              onClick={() => { navigator.clipboard.writeText(svgPath); alert('SVG Path copied to clipboard!'); }}
              disabled={!svgPath}
              className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg shadow-brand-blue/20"
            >
              <Check className="w-4 h-4" /> Copy SVG Path
            </button>
            <button 
              onClick={() => setImage(null)}
              className="w-full py-3 mt-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 hover:text-white transition-colors text-sm"
            >
              Upload Different Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
