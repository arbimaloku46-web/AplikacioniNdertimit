const fs = require('fs');
const code = fs.readFileSync('App.tsx', 'utf8');

function validateTags(code) {
  const tagRegex = /<\/?([a-zA-Z0-9]+)(>|\s[^>]*>)/g;
  let m;
  const stack = [];
  const selfClosing = new Set(['input', 'img', 'br', 'hr', 'source', 'div', 'main', 'p', 'span']); // we don't care about these if they end with />
  // actually wait, let's just write a proper parser.
}
