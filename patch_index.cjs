const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (!code.includes('Content-Security-Policy')) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="frame-src 'self' https://poly.cam https://floorfy.com https://*.youtube.com https://youtube.com https://*.vimeo.com https://vimeo.com;">`;
  code = code.replace('<meta name="theme-color"', csp + '\n    <meta name="theme-color"');
  fs.writeFileSync('index.html', code);
  console.log('Patched index.html with CSP');
} else {
  console.log('CSP already exists');
}
