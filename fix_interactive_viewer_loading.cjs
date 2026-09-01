const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf-8');

if (!code.includes("import { LoadingSpinner }")) {
  code = code.replace(
    "import { InteractiveBuilding, Floor, Unit } from '../types';",
    "import { InteractiveBuilding, Floor, Unit } from '../types';\nimport { LoadingSpinner } from './LoadingSpinner';"
  );
  
  // Add an isTransitioning state
  code = code.replace(
    "const [hoveredPath, setHoveredPath] = useState<string | null>(null);",
    "const [hoveredPath, setHoveredPath] = useState<string | null>(null);\n  const [isTransitioning, setIsTransitioning] = useState(false);\n  const [transitionTarget, setTransitionTarget] = useState<'building' | 'floor' | 'unit'>('building');"
  );
  
  // Update handleFloorClick
  const oldHandleFloorClick = `  const handleFloorClick = (floor: Floor) => {
    setActiveFloorId(floor.id);
    setLevel('floor');
    setHoveredPath(null);
  };`;
  const newHandleFloorClick = `  const handleFloorClick = (floor: Floor) => {
    setIsTransitioning(true);
    setTransitionTarget('floor');
    setHoveredPath(null);
    setTimeout(() => {
      setActiveFloorId(floor.id);
      setLevel('floor');
      setIsTransitioning(false);
    }, 500);
  };`;
  code = code.replace(oldHandleFloorClick, newHandleFloorClick);

  // Update handleUnitClick
  const oldHandleUnitClick = `  const handleUnitClick = (unit: Unit) => {
    setActiveUnitId(unit.id);
    setLevel('unit');
    setHoveredPath(null);
  };`;
  const newHandleUnitClick = `  const handleUnitClick = (unit: Unit) => {
    setIsTransitioning(true);
    setTransitionTarget('unit');
    setHoveredPath(null);
    setTimeout(() => {
      setActiveUnitId(unit.id);
      setLevel('unit');
      setIsTransitioning(false);
    }, 500);
  };`;
  code = code.replace(oldHandleUnitClick, newHandleUnitClick);

  // Update goBack
  const oldGoBack = `  const goBack = () => {
    if (level === 'unit') {
      setLevel('floor');
      setActiveUnitId(null);
    } else if (level === 'floor') {
      setLevel('building');
      setActiveFloorId(null);
    }
  };`;
  const newGoBack = `  const goBack = () => {
    setIsTransitioning(true);
    if (level === 'unit') {
      setTransitionTarget('floor');
      setTimeout(() => {
        setLevel('floor');
        setActiveUnitId(null);
        setIsTransitioning(false);
      }, 500);
    } else if (level === 'floor') {
      setTransitionTarget('building');
      setTimeout(() => {
        setLevel('building');
        setActiveFloorId(null);
        setIsTransitioning(false);
      }, 500);
    }
  };`;
  code = code.replace(oldGoBack, newGoBack);

  // Now render the LoadingSpinner when isTransitioning is true
  // Let's find the main content block to overlay
  const mainContentRegex = /<div className="flex-1 overflow-hidden relative">/;
  code = code.replace(
    mainContentRegex,
    `<div className="flex-1 overflow-hidden relative">
        {isTransitioning && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
            <LoadingSpinner message={\`Loading \${transitionTarget}...\`} />
          </div>
        )}`
  );

  fs.writeFileSync('components/InteractiveViewer.tsx', code);
}
