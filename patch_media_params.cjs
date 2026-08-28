const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf8');

const oldCheck = `                                <iframe 
                                    src={(slide as any).embedUrl}`;

const newCheck = `                                <iframe 
                                    src={((slide as any).embedUrl && (slide as any).embedUrl.includes('poly.cam/capture/')) 
                                        ? ((slide as any).embedUrl.includes('cookie_consent') ? (slide as any).embedUrl : (slide as any).embedUrl + ((slide as any).embedUrl.includes('?') ? '&' : '?') + 'gdpr=0&cookie_consent=true')
                                        : (slide as any).embedUrl}`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('components/MediaGrid.tsx', code);
  console.log('Patched MediaGrid.tsx URL params');
} else {
  console.log('Could not find MediaGrid.tsx iframe src block');
}
