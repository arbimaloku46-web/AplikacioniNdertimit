const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

code = code.replace(
    /                        \)}\n                    <\/div>\n                <\/div>\n\n                                   \)}\n                <div className=\{\`grid grid-cols-1/g,
    `                        )}\n                    </div>\n                    )}\n                </div>\n                <div className={\`grid grid-cols-1`
);

fs.writeFileSync('App.tsx', code);
