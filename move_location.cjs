const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Find the block
const locationBlock = `{activeProject.coordinates && (
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

// Wait, the indentation might be different. I will use regex.
