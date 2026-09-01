const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

const targetStr = "<button key={i} onClick={() => setActiveUpdateIndex(i)} className={`relative min-w-[130px]";
const newStr = "<button id={`week-btn-${i}`} key={i} onClick={() => setActiveUpdateIndex(i)} className={`relative min-w-[130px]";

content = content.replace(targetStr, newStr);

fs.writeFileSync('App.tsx', content);
