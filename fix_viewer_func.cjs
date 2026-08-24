const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

if (!code.includes('const getPathCenter = (pathData: string)')) {
  const targetStr = `  // Handlers
  const handleFloorSelect = (floorId: string) => {`;
  
  const replacementStr = `  // Helper to calculate center of path for labels
  const getPathCenter = (pathData: string) => {
    if (!pathData) return { x: 50, y: 50 };
    const points = pathData.replace('M', '').replace('Z', '').trim().split('L').map(p => {
      const [x, y] = p.trim().split(' ').map(Number);
      return { x, y };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
    if (points.length === 0) return { x: 50, y: 50 };
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  };

  // Handlers
  const handleFloorSelect = (floorId: string) => {`;
  
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('components/InteractiveViewer.tsx', code);
  console.log('Added getPathCenter to InteractiveViewer');
}
