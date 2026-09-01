const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const regex = /onClose=\{\(\) => setCurrentView\(AppView\.PROJECT_DETAIL\)\}/g;
const replace = `onClose={() => {
    setIsNavigating(true);
    setTimeout(() => {
        setCurrentView(AppView.PROJECT_DETAIL);
        setIsNavigating(false);
    }, 400);
}}`;

code = code.replace(regex, replace);

fs.writeFileSync('App.tsx', code);
