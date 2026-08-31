const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const oldButton = `<button 
                            onClick={() => setCurrentView(AppView.INTERACTIVE_VIEWER)}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-2 rounded-2xl text-sm font-extrabold tracking-tight shadow-lg shadow-emerald-500/20 transition-all group"
                          >
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Explore Building
                          </button>`;

const newButton = `<button 
                            onClick={() => setCurrentView(AppView.INTERACTIVE_VIEWER)}
                            className="w-full md:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white px-8 py-3.5 rounded-2xl text-base font-extrabold tracking-tight shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-500 group relative overflow-hidden active:scale-95"
                          >
                            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <span className="relative z-10">Explore Building</span>
                          </button>`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('App.tsx', code);
