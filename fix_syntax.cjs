const fs = require('fs');

let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

// I need to find the `              </div>\n            </div>\n\n            {mode !== 'idle' && (` block.
// and replace it with `              </div>\n              </div>\n            </div>\n\n            {mode !== 'idle' && (`

const regex = /              <\/div>\s*<\/div>\s*\{mode !== 'idle' && \(/;
code = code.replace(regex, `                </div>\n              </div>\n            </div>\n\n            {mode !== 'idle' && (`);

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Fixed syntax!');
