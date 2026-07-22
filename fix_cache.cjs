const fs = require('fs');

let indexHtml = fs.readFileSync('index.tsx', 'utf8');
indexHtml = indexHtml.replace(/if \('serviceWorker' in navigator\) \{[\s\S]*?\}/, `if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}`);
fs.writeFileSync('index.tsx', indexHtml);

let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
viteConfig = viteConfig.replace(/VitePWA\(\{[\s\S]*?\}\)/, "VitePWA({ registerType: 'autoUpdate', injectRegister: 'null', workbox: { clientsClaim: true, skipWaiting: true } })");
fs.writeFileSync('vite.config.ts', viteConfig);
