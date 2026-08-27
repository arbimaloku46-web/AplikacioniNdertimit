const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf8');

const oldCheck = `  if (!url) {`;
const newCheck = `  let displayUrl = url;
  if (displayUrl && displayUrl.includes('poly.cam/capture/') && !displayUrl.includes('/embed') && !displayUrl.includes('embed=')) {
      displayUrl = displayUrl.replace(/\\/$/, '') + '/embed';
  }

  if (!url) {`;

if (code.includes(oldCheck) && !code.includes('displayUrl = url')) {
  code = code.replace(oldCheck, newCheck);
  // Also need to change src={url} to src={displayUrl}
  code = code.replace(/src=\{url\}/g, 'src={displayUrl}');
  fs.writeFileSync('components/SplatViewer.tsx', code);
  console.log('Patched SplatViewer URL handling');
} else {
  console.log('Could not patch SplatViewer');
}
