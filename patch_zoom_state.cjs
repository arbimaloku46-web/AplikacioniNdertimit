const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const oldStr = `  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);`;

const newStr = `  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);`;

code = code.replace(oldStr, newStr);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Patched zoom state');
