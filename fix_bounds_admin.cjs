const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const hookAddition = `
  const [imageBounds, setImageBounds] = useState({ top: 0, left: 0, width: 100, height: 100 });

  const updateImageBounds = () => {
    if (imgRef.current) {
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
      
      setImageBounds({
         top: (img.offsetHeight - renderedHeight) / 2,
         left: (img.offsetWidth - renderedWidth) / 2,
         width: renderedWidth,
         height: renderedHeight
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateImageBounds);
    return () => window.removeEventListener('resize', updateImageBounds);
  }, []);
`;

code = code.replace("const imgRef = useRef<HTMLImageElement>(null);", "const imgRef = useRef<HTMLImageElement>(null);" + hookAddition);
code = code.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef, useEffect } from 'react';");

const newHandleClick = `  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || mode === 'idle') return;
    
    // Get click relative to the img element
    const rect = imgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to click relative to the actual rendered image pixels
    const clickXOnImage = clickX - imageBounds.left;
    const clickYOnImage = clickY - imageBounds.top;
    
    // Convert to percentage
    const percentX = (clickXOnImage / imageBounds.width) * 100;
    const percentY = (clickYOnImage / imageBounds.height) * 100;
    
    // Clamp
    if (percentX >= 0 && percentX <= 100 && percentY >= 0 && percentY <= 100) {
      setPoints([...points, { x: percentX, y: percentY }]);
    }
  };`;

const oldHandleClick = /const handleImageClick = \(e: React\.MouseEvent<HTMLImageElement>\) => \{[\s\S]*?setPoints\(\[\.\.\.points, \{ x, y \}\]\);\s*\};/;

code = code.replace(oldHandleClick, newHandleClick);


const oldWrapper = `              <div className="relative flex min-h-0 min-w-0 max-w-full max-h-full rounded-2xl shadow-2xl" style={{ lineHeight: 0 }}>
                <img 
                  ref={imgRef}
                  src={imageUrl} 
                  alt="Reference" 
                  className={\`block min-w-0 min-h-0 max-w-full max-h-full w-auto h-auto rounded-2xl select-none \${mode !== 'idle' ? 'cursor-crosshair' : ''}\`} 
                  draggable={false}
                  onClick={handleImageClick}
                />
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">`;

const newWrapper = `              <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-slate-900/50" style={{ lineHeight: 0 }}>
                <img 
                  ref={imgRef}
                  src={imageUrl} 
                  alt="Reference" 
                  className={\`w-full h-full object-contain rounded-2xl select-none \${mode !== 'idle' ? 'cursor-crosshair' : ''}\`} 
                  draggable={false}
                  onClick={handleImageClick}
                  onLoad={updateImageBounds}
                />
                <div className="absolute pointer-events-none" style={{ top: imageBounds.top, left: imageBounds.left, width: imageBounds.width, height: imageBounds.height }}>
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">`;

code = code.replace(oldWrapper, newWrapper);

// Also need to close the extra div for the svg container
const oldSvgClose = `                </svg>
              </div>`;
const newSvgClose = `                  </svg>
                </div>
              </div>`;

code = code.replace(oldSvgClose, newSvgClose);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Done BuildingConfigurator');
