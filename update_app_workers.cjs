const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

const adminWorkersInput = `<div><label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Workers</label><input type="number" className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.updates[activeUpdateIndex].stats.workersOnSite} onChange={e => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))} /></div>`;

const adminWorkersReplacement = `<div>
                                            <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Total Workers</label>
                                            <input type="number" className="w-full bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white" value={activeProject.updates[activeUpdateIndex].stats.workersOnSite} onChange={e => handleUpdateField('stats.workersOnSite', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-white/5">
                                        <label className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tight mb-2 block">Worker Breakdown</label>
                                        {(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || []).map((wb, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                                <input className="flex-1 bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-xl px-4 py-2 text-xs text-white" placeholder="Type (e.g. Facade)" value={wb.type} onChange={e => {
                                                    const newBreakdown = [...(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || [])];
                                                    newBreakdown[idx].type = e.target.value;
                                                    handleUpdateField('stats.workerBreakdown', newBreakdown);
                                                }} />
                                                <input type="number" className="w-20 bg-brand-dark border border-white/5 shadow-2xl shadow-black/40 rounded-xl px-4 py-2 text-xs text-white" placeholder="Count" value={wb.count} onChange={e => {
                                                    const newBreakdown = [...(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || [])];
                                                    newBreakdown[idx].count = parseInt(e.target.value) || 0;
                                                    handleUpdateField('stats.workerBreakdown', newBreakdown);
                                                    const total = newBreakdown.reduce((sum, item) => sum + item.count, 0);
                                                    handleUpdateField('stats.workersOnSite', total);
                                                }} />
                                                <button className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors" onClick={() => {
                                                    const newBreakdown = (activeProject.updates[activeUpdateIndex].stats.workerBreakdown || []).filter((_, i) => i !== idx);
                                                    handleUpdateField('stats.workerBreakdown', newBreakdown);
                                                    const total = newBreakdown.reduce((sum, item) => sum + item.count, 0);
                                                    handleUpdateField('stats.workersOnSite', total);
                                                }}><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <button className="text-brand-blue text-[10px] font-extrabold uppercase tracking-widest mt-2 flex items-center hover:text-blue-400 transition-colors" onClick={() => {
                                            const newBreakdown = [...(activeProject.updates[activeUpdateIndex].stats.workerBreakdown || []), { type: '', count: 0 }];
                                            handleUpdateField('stats.workerBreakdown', newBreakdown);
                                        }}>+ Add Worker Type</button>
                                        <p className="text-[10px] text-slate-500 mt-2">Will auto-calculate total workers when breakdown is provided.</p>`;

content = content.replace(adminWorkersInput + \`
                                    </div>\`, adminWorkersReplacement);

const userWorkersInput = \`<div className="bg-white/5 p-3 md:p-6 rounded-2xl md:rounded-2xl flex flex-col justify-between h-full min-h-[80px]">
                                          <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase block mb-1">Workforce</span>
                                          <span className="text-white text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-none">{activeProject.updates[activeUpdateIndex].stats.workersOnSite} <span className="text-sm text-slate-500 font-sans font-medium">Active</span></span>
                                        </div>\`;

const userWorkersReplacement = \`<div className="bg-white/5 p-3 md:p-6 rounded-2xl md:rounded-2xl flex flex-col justify-between h-full min-h-[80px] relative group cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                          <div className="flex justify-between items-center w-full mb-1">
                                            <span className="text-[10px] text-slate-500 font-extrabold tracking-tight uppercase">Workforce</span>
                                            {(activeProject.updates[activeUpdateIndex].stats.workerBreakdown?.length || 0) > 0 && (
                                              <ChevronDown className="w-4 h-4 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            )}
                                          </div>
                                          <span className="text-white text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-none">{activeProject.updates[activeUpdateIndex].stats.workersOnSite} <span className="text-sm text-slate-500 font-sans font-medium">Active</span></span>
                                          
                                          {/* Dropdown content */}
                                          {(activeProject.updates[activeUpdateIndex].stats.workerBreakdown?.length || 0) > 0 && (
                                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-slate-800 border border-white/10 rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-2xl pointer-events-none group-hover:pointer-events-auto">
                                              <div className="flex flex-col gap-2">
                                                {activeProject.updates[activeUpdateIndex].stats.workerBreakdown!.map((wb, idx) => (
                                                  <div key={idx} className="flex justify-between items-center text-xs text-white border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-slate-400 font-medium">{wb.type || 'Unknown'}</span>
                                                    <span className="font-extrabold">{wb.count}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>\`;

content = content.replace(userWorkersInput, userWorkersReplacement);

fs.writeFileSync('App.tsx', content);
