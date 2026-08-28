const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const oldCode = `extracted = extracted.replace(/\\/$/, '') + '/embed';`;
const newCode = `extracted = extracted.replace(/\\/$/, '') + '/embed?gdpr=0&cookie_consent=true';`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('App.tsx', code);
  console.log('Patched App.tsx');
}
