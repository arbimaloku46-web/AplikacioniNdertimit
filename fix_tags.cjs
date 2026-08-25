const fs = require('fs');

let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// Level 1:
// Find `<ImageWithOverlay src={data.mainImageUrl} alt={data.name}>`
// And we need to close it before `            </motion.div>\n          )}\n\n          {/* LEVEL 2: FLOOR PLAN */}`
const level1End = `                   </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 2: FLOOR PLAN */}`;
const level1EndFix = `                   </AnimatePresence>
                </ImageWithOverlay>
              </div>
            </motion.div>
          )}

          {/* LEVEL 2: FLOOR PLAN */}`;
code = code.replace(level1End, level1EndFix);


// Level 2:
// Find `<ImageWithOverlay src={activeFloor.floorPlanUrl} alt={activeFloor.name}>`
// And we need to close it before `              <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-w-0 min-h-0">`
const level2End = `                    })}
                  </div>
                </div>
              <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-w-0 min-h-0">`;
const level2EndFix = `                    })}
                  </ImageWithOverlay>
                </div>
              <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-w-0 min-h-0">`;
code = code.replace(level2End, level2EndFix);


// Remove the bad regex replacements that might be hanging at the end of the file
const badEnd = `                  </ImageWithOverlay>
                </div>
              </div>
              <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-w-0 min-h-0">`;
code = code.replace(badEnd, `              <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-w-0 min-h-0">`);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
console.log('Fixed syntax!');
