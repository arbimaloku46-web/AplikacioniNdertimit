const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace tailwind config colors
html = html.replace(/'#151f32'/g, "'#18181b'"); // slate-850 to zinc-900
html = html.replace(/'#020617'/g, "'#09090b'"); // slate-950 to zinc-950
html = html.replace(/'#002147'/g, "'#0a0a0a'"); // brand-dark to neutral very dark
html = html.replace(/'#2264ab'/g, "'#8c8273'"); // brand-blue to architectural taupe/grey

// Replace CSS styles
html = html.replace(/background-color: #002147;/g, "background-color: #0a0a0a;");
html = html.replace(/color: #e2e8f0;/g, "color: #a1a1aa;");
html = html.replace(/background: #00152e;/g, "background: #000000;");
html = html.replace(/background: #2264ab;/g, "background: #3f3f46;");
html = html.replace(/background: #1a4d85;/g, "background: #52525b;");
html = html.replace(/background: rgba\(0, 33, 71, 0\.6\);/g, "background: rgba(10, 10, 10, 0.8);");
html = html.replace(/border: 1px solid rgba\(34, 100, 171, 0\.2\);/g, "border: 1px solid rgba(255, 255, 255, 0.05);");

fs.writeFileSync('index.html', html, 'utf8');
