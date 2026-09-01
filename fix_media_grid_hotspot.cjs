const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

const hotspotCode = `
const HotspotEditorOverlay: React.FC<{
  mediaItem: MediaItem;
  isAdmin?: boolean;
  onUpdate?: (updated: MediaItem) => void;
}> = ({ mediaItem, isAdmin, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<Partial<Hotspot> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hotspots = mediaItem.hotspots || [];

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isAdmin || !isEditing) {
      setActiveHotspot(null);
      return;
    }
    
    if (editingHotspot) return; // Currently editing one
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setEditingHotspot({
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      title: '',
      description: '',
      status: 'pending'
    });
  };

  const saveHotspot = () => {
    if (!editingHotspot || !editingHotspot.title || !onUpdate) return;
    
    const isExisting = hotspots.some(h => h.id === editingHotspot.id);
    const newHotspots = isExisting 
      ? hotspots.map(h => h.id === editingHotspot.id ? (editingHotspot as Hotspot) : h)
      : [...hotspots, (editingHotspot as Hotspot)];
      
    onUpdate({ ...mediaItem, hotspots: newHotspots });
    setEditingHotspot(null);
  };

  const deleteHotspot = (id: string) => {
    if (!onUpdate) return;
    onUpdate({ ...mediaItem, hotspots: hotspots.filter(h => h.id !== id) });
    setEditingHotspot(null);
    setActiveHotspot(null);
  };

  return (
    <div 
        ref={containerRef} 
        className="absolute inset-0 z-[120]"
        onClick={handleImageClick}
        style={{ cursor: isEditing ? 'crosshair' : 'default' }}
    >
        {isAdmin && (
            <div className="absolute top-4 right-4 z-[130]">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); setEditingHotspot(null); setActiveHotspot(null); }}
                    className={\`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg \${isEditing ? 'bg-brand-blue text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}\`}
                >
                    {isEditing ? 'Done Editing' : 'Edit Hotspots'}
                </button>
            </div>
        )}

        {hotspots.map(hotspot => (
            <div 
                key={hotspot.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-[125]"
                style={{ left: \`\${hotspot.x}%\`, top: \`\${hotspot.y}%\` }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isEditing) {
                        setEditingHotspot(hotspot);
                    } else {
                        setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
                    }
                }}
            >
                <div className={\`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 \${
                    hotspot.status === 'completed' ? 'bg-emerald-500 text-white' :
                    hotspot.status === 'in-progress' ? 'bg-amber-500 text-white' :
                    'bg-brand-blue text-white'
                }\`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                
                {!isEditing && activeHotspot?.id === hotspot.id && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-[130]">
                        <h4 className="text-white font-bold mb-1">{hotspot.title}</h4>
                        <p className="text-slate-400 text-xs">{hotspot.description}</p>
                    </div>
                )}
            </div>
        ))}

        {isEditing && editingHotspot && (
            <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-[140]"
                style={{ left: \`\${editingHotspot.x}%\`, top: \`\${editingHotspot.y}%\` }}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-64 bg-slate-900 border border-brand-blue/50 rounded-2xl p-4 shadow-2xl">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Title"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-brand-blue"
                        value={editingHotspot.title}
                        onChange={e => setEditingHotspot({...editingHotspot, title: e.target.value})}
                    />
                    <textarea
                        placeholder="Description..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-brand-blue h-20 resize-none"
                        value={editingHotspot.description}
                        onChange={e => setEditingHotspot({...editingHotspot, description: e.target.value})}
                    />
                    <div className="flex gap-2">
                        <select
                            className="bg-white/5 border border-white/10 rounded-lg px-2 text-xs text-white focus:outline-none"
                            value={editingHotspot.status}
                            onChange={e => setEditingHotspot({...editingHotspot, status: e.target.value as any})}
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <div className="flex-1" />
                        <button 
                            onClick={() => deleteHotspot(editingHotspot.id!)}
                            className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={saveHotspot}
                            className="p-2 bg-brand-blue hover:bg-brand-blue/80 text-white rounded-lg transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
`;

code = code.replace(
  "// --- Main MediaGrid Component ---",
  hotspotCode + "\n// --- Main MediaGrid Component ---"
);

fs.writeFileSync('components/MediaGrid.tsx', code);
