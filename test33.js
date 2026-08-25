import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #333; height: 100vh; display: flex; flex-direction: column; }
        
        .c1 { flex: 1; min-height: 0; min-width: 0; display: flex; align-items: center; justify-content: center; background: #111; overflow: hidden; padding: 2rem; box-sizing: border-box; }
        
        .wrapper { position: relative; max-width: 100%; max-height: 100%; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; border: 2px solid yellow; }
        img { display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; min-width: 0; min-height: 0; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="c1">
        <div class="wrapper" id="w1">
          <img id="img1" src="https://fastly.picsum.photos/id/111/400/2000.jpg?hmac=X" />
        </div>
      </div>
      <div class="c1">
        <div class="wrapper" id="w2">
          <img id="img2" src="https://fastly.picsum.photos/id/111/2000/400.jpg?hmac=X" />
        </div>
      </div>
      <script>
        setTimeout(() => {
          const w1 = document.getElementById('w1').getBoundingClientRect();
          const i1 = document.getElementById('img1').getBoundingClientRect();
          const w2 = document.getElementById('w2').getBoundingClientRect();
          const i2 = document.getElementById('img2').getBoundingClientRect();
          console.log('wrapper1:', w1.width, 'x', w1.height);
          console.log('img1:', i1.width, 'x', i1.height);
          console.log('wrapper2:', w2.width, 'x', w2.height);
          console.log('img2:', i2.width, 'x', i2.height);
        }, 1000);
      </script>
    </body>
    </html>
  `);
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
