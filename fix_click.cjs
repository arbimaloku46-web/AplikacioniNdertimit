const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const oldHandleClick = `  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || mode === 'idle') return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints([...points, { x, y }]);
  };`;

const newHandleClick = `  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || mode === 'idle') return;
    // Use nativeEvent offset to get exact coordinates relative to the element, regardless of scrolling or bounding box edge cases
    const x = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * 100;
    const y = (e.nativeEvent.offsetY / e.currentTarget.offsetHeight) * 100;
    setPoints([...points, { x, y }]);
  };`;

code = code.replace(oldHandleClick, newHandleClick);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Fixed click');
