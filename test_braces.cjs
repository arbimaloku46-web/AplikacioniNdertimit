const fs = require('fs');
const code = fs.readFileSync('App.tsx', 'utf8');

let stack = [];
for (let i = 0; i < code.length; i++) {
  let char = code[i];
  if (char === '{' || char === '(' || char === '<') {
    stack.push({char, line: code.substring(0, i).split('\\n').length});
  } else if (char === '}' || char === ')' || char === '>') {
    if (stack.length === 0) {
      console.log('Unbalanced', char, 'at line', code.substring(0, i).split('\\n').length);
      return;
    }
    let last = stack.pop();
    // we don't strictly check < > matching because of JSX complexity, just counting braces and parens might be better
  }
}
