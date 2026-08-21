const fs = require('fs');
const child_process = require('child_process');

function getFirstError() {
  try {
    child_process.execSync('npx tsc --noEmit App.tsx', { stdio: 'pipe' });
    return null;
  } catch (err) {
    const output = err.stdout.toString();
    const match = output.match(/App\.tsx\((\d+),\d+\): error TS17008: JSX element '([^']+)' has no corresponding closing tag/);
    if (match) {
      return { line: parseInt(match[1]), tag: match[2] };
    }
    // Also look for JSX fragment error
    const matchFrag = output.match(/App\.tsx\((\d+),\d+\): error TS17014: JSX fragment has no corresponding closing tag/);
    if (matchFrag) {
      return { line: parseInt(matchFrag[1]), tag: '>' };
    }
    return null;
  }
}

let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');

function getIndentation(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

let error = getFirstError();
while (error) {
  console.log(`Fixing unclosed ${error.tag} starting at line ${error.line}`);
  const openLine = error.line - 1;
  const targetIndent = getIndentation(lines[openLine]);
  
  let inserted = false;
  for (let i = openLine + 1; i < lines.length; i++) {
    // If we find a line with the same or less indentation that looks like it could have held the closing tag
    const indent = getIndentation(lines[i]);
    if (indent <= targetIndent && (lines[i].trim() === '' || lines[i].trim() === '{" "}')) {
      const closingTag = error.tag === '>' ? '</>' : `</${error.tag}>`;
      const spaces = ' '.repeat(targetIndent);
      const suffix = lines[i].trim() === '{" "}' ? ' {" "}' : '';
      lines[i] = spaces + closingTag + suffix;
      fs.writeFileSync('App.tsx', lines.join('\n'));
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    console.log("Could not find a place to insert!");
    break;
  }
  
  const nextError = getFirstError();
  if (!nextError || nextError.line === error.line) {
    console.log("Error did not change or no more errors!");
    break;
  }
  error = nextError;
}
console.log("Done.");
