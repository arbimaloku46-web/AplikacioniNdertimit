const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf8');

const oldCheck = `  if (displayUrl && displayUrl.includes('poly.cam/capture/') && !displayUrl.includes('/embed') && !displayUrl.includes('embed=')) {
      displayUrl = displayUrl.replace(/\\/$/, '') + '/embed';
  }`;

const newCheck = `  if (displayUrl && displayUrl.includes('poly.cam/capture/') && !displayUrl.includes('/embed') && !displayUrl.includes('embed=')) {
      displayUrl = displayUrl.replace(/\\/$/, '') + '/embed?gdpr=0&cookie_consent=true';
  }`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('components/SplatViewer.tsx', code);
  console.log('Patched SplatViewer.tsx URL params');
} else {
  console.log('Could not find displayUrl block in SplatViewer.tsx');
}
