const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

const target1 = '<div className="relative inline-block w-full max-w-full rounded-2xl overflow-hidden shadow-2xl">';
const replacement1 = '<div className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl">';

const target2 = 'className={`w-full h-auto object-contain block select-none ${mode !== \'idle\' ? \'cursor-crosshair\' : \'\'}`}';
const replacement2 = 'className={`block w-auto h-auto max-w-full max-h-[75vh] select-none ${mode !== \'idle\' ? \'cursor-crosshair\' : \'\'}`}';

if (code.includes(target1) && code.includes(target2)) {
    code = code.replace(target1, replacement1);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('components/BuildingConfigurator.tsx', code);
    console.log("Patched BuildingConfigurator.tsx fallback");
} else {
    console.log("Not found. Check targets.");
    if (!code.includes(target1)) console.log("Target 1 not found");
    if (!code.includes(target2)) console.log("Target 2 not found");
}
