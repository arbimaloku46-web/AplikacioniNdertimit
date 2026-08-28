const fs = require('fs');
let code = fs.readFileSync('components/SplatViewer.tsx', 'utf8');

const oldCheck = `  let displayUrl = url;
  if (displayUrl && displayUrl.includes('poly.cam/capture/') && !displayUrl.includes('/embed') && !displayUrl.includes('embed=')) {
      displayUrl = displayUrl.replace(/\\/$/, '') + '/embed?gdpr=0&cookie_consent=true';
  }`;

const newCheck = `  let displayUrl = url;
  if (displayUrl && displayUrl.includes('poly.cam/capture/')) {
      if (!displayUrl.includes('/embed') && !displayUrl.includes('embed=')) {
          displayUrl = displayUrl.replace(/\\/$/, '') + '/embed';
      }
      if (!displayUrl.includes('cookie_consent')) {
          displayUrl += (displayUrl.includes('?') ? '&' : '?') + 'gdpr=0&cookie_consent=true';
      }
  }`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('components/SplatViewer.tsx', code);
  console.log('Patched SplatViewer.tsx URL params 2');
} else {
  console.log('Could not find displayUrl block in SplatViewer.tsx');
}
