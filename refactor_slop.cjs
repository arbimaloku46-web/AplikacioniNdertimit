const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && f !== 'node_modules' && f !== '.git' && f !== 'dist') {
            walk(dirPath, callback);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            callback(path.join(dir, f));
        }
    });
}

const replacements = [
    [/rounded-3xl/g, 'rounded-lg'],
    [/rounded-2xl/g, 'rounded-md'],
    [/text-\[10px\]/g, 'text-sm'],
    [/text-\[8px\]/g, 'text-xs'],
    [/text-\[9px\]/g, 'text-xs'],
    [/\buppercase\b/g, ''],
    [/\btracking-widest\b/g, ''],
    [/\btracking-tight\b/g, 'tracking-normal'],
    [/\bfont-extrabold\b/g, 'font-semibold'],
    [/\bshadow-2xl\b/g, 'shadow-md'],
    [/\bshadow-xl\b/g, 'shadow-sm'],
    [/\bshadow-lg\b/g, 'shadow-sm'],
    [/\bshadow-\[.*?\]\b/g, 'shadow-sm'],
    [/\bhover:-translate-y-1\b/g, ''],
    [/\bhover:scale-\[1\.02\]\b/g, ''],
    [/\bactive:scale-95\b/g, ''],
    [/\bborder-dashed\b/g, 'border-solid'],
    [/\bbg-gradient-to-[a-z]+\b/g, ''],
    [/\bfrom-[a-z0-9-]+\b/g, ''],
    [/\bvia-[a-z0-9-]+\b/g, ''],
    [/\bto-[a-z0-9-]+\b/g, ''],
    [/\bbackdrop-blur-(xl|2xl|md|sm)\b/g, ''],
    [/\bglass-panel\b/g, 'bg-slate-900 border border-slate-800'],
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace typical slop classes
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Fix multiple spaces created by removing classes
    content = content.replace(/className=(["'`])\s+/g, 'className=$1');
    content = content.replace(/\s+(["'`])/g, '$1');
    content = content.replace(/\s{2,}/g, ' ');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed', filePath);
    }
}

// Process root TSX and src directory
['App.tsx', 'index.tsx'].forEach(f => {
    if (fs.existsSync(f)) processFile(f);
});

if (fs.existsSync('src')) {
    walk('src', processFile);
}
if (fs.existsSync('components')) {
    walk('components', processFile);
}
