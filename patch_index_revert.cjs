const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (code.includes('Content-Security-Policy')) {
  code = code.replace(/<meta http-equiv="Content-Security-Policy"[^>]+>\n\s*/, '');
  fs.writeFileSync('index.html', code);
  console.log('Reverted CSP from index.html');
}
