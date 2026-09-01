const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const regex1 = /onClick=\{\(\) => \{ setActiveProject\(null\); setCurrentView\(AppView\.HOME\); \}\}/g;
const replace1 = `onClick={() => {
    setIsNavigating(true);
    setTimeout(() => {
        setActiveProject(null);
        setCurrentView(AppView.HOME);
        setIsNavigating(false);
    }, 400);
}}`;

code = code.replace(regex1, replace1);

const regex2 = /onClick=\{\(\) => setCurrentView\(AppView\.HOME\)\}/g;
const replace2 = `onClick={() => {
    setIsNavigating(true);
    setTimeout(() => {
        setCurrentView(AppView.HOME);
        setIsNavigating(false);
    }, 400);
}}`;

code = code.replace(regex2, replace2);

fs.writeFileSync('App.tsx', code);
