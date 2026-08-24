const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// The exact string block we want to move
const exactLocationBlock = `                                    {activeProject.coordinates && (
                                        <div className="-mx-8 -mb-8 mt-8 border-t border-white/5 relative overflow-hidden rounded-b-3xl">
                                            <div className="absolute top-4 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                                                <span className="text-[10px] text-white font-extrabold tracking-tight uppercase tracking-widest block">Exact Location</span>
                                            </div>
                                            <LocationPicker 
                                                initialPosition={activeProject.coordinates}
                                                readOnly={true}
                                            />
                                        </div>
                                    )}`;

const replacementInFirstContainer = ``;

const newMapContainer = `
                        {/* Map Container */}
                        {activeProject.coordinates && (
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl relative z-10">
                                <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-none">
                                    <span className="text-[10px] text-white font-extrabold tracking-tight uppercase tracking-widest block">Exact Location</span>
                                </div>
                                <LocationPicker 
                                    initialPosition={activeProject.coordinates}
                                    readOnly={true}
                                />
                            </div>
                        )}`;

if (code.includes(exactLocationBlock)) {
    code = code.replace(exactLocationBlock, replacementInFirstContainer);
    
    // Find where the first container closes
    // It closes just before {/* Admin Media Uploader */}
    const targetString = `                        {/* Admin Media Uploader */}`;
    code = code.replace(targetString, newMapContainer + '\n' + targetString);
    
    fs.writeFileSync('App.tsx', code);
    console.log("Moved location map!");
} else {
    console.log("Could not find location block!");
}
