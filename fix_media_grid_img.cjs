const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf-8');

const regex = /<img\s*src=\{thumbUrl\}\s*alt=\{item\.description\}\s*className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"\s*loading="lazy"\s*decoding="async"\s*\/>/g;

code = code.replace(regex, `<ProgressiveImage 
                                                  src={thumbUrl} 
                                                  alt={item.description}
                                                  className="transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                                            />`);

fs.writeFileSync('components/MediaGrid.tsx', code);
