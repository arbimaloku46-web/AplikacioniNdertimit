const fs = require('fs');
let code = fs.readFileSync('components/InteractiveViewer.tsx', 'utf8');

// The easiest way is to just grab the raw text of InteractiveViewer, find the issues, and fix them.
// Let's replace the loop body that renders floor labels:
const searchString = `                      <div 
                        className="bg-slate-900/80 backdrop-blur-md border text-white text-[10px] sm:text-xs font-extrabold tracking-tight px-2.5 py-1 sm:py-1.5 rounded-lg shadow-xl whitespace-nowrap transition-all duration-300 ease-in-out"
                        style={{ borderColor: isHovered ? colorScheme.border : 'rgba(255,255,255,0.2)' }}
                      >
                        {floor.name}
                      </div>
                            </div>
    </div>
  );
})}`;

const fixedString = `                      <div 
                        className="bg-slate-900/80 backdrop-blur-md border text-white text-[10px] sm:text-xs font-extrabold tracking-tight px-2.5 py-1 sm:py-1.5 rounded-lg shadow-xl whitespace-nowrap transition-all duration-300 ease-in-out"
                        style={{ borderColor: isHovered ? colorScheme.border : 'rgba(255,255,255,0.2)' }}
                      >
                        {floor.name}
                      </div>
                    </div>
                  );
                })}`;

code = code.replace(searchString, fixedString);

// Also at the end of the file, it had
/*
411|                    </AnimatePresence>
412|          </div>
413|      );
414|  }
*/
const searchString2 = `                  </AnimatePresence>
        </div>
    );
}`;

const fixedString2 = `                  </AnimatePresence>
        </div>
      </div>
    );
}`;
code = code.replace(searchString2, fixedString2);

fs.writeFileSync('components/InteractiveViewer.tsx', code);
