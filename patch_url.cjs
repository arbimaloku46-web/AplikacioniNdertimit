const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const oldFunc = `  const extractUrlFromEmbed = (input: string) => {
    if (!input) return '';
    const srcMatch = input.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : input;
  };`;

const newFunc = `  const extractUrlFromEmbed = (input: string) => {
    if (!input) return '';
    let extracted = input;
    const srcMatch = input.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      extracted = srcMatch[1];
    }
    
    // Polycam formatting
    if (extracted.includes('poly.cam/capture/') && !extracted.includes('/embed') && !extracted.includes('embed=')) {
      // Remove trailing slash if exists
      extracted = extracted.replace(/\\/$/, '');
      extracted = extracted + '/embed';
    }
    return extracted;
  };`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync('App.tsx', code);
  console.log('Patched extractUrlFromEmbed');
} else {
  console.log('Could not find extractUrlFromEmbed');
}
