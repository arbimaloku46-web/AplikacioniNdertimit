const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #333; height: 100vh; }
        .screen { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 2rem; box-sizing: border-box; overflow: hidden; min-height: 0; min-width: 0; }
        .wrapper { position: relative; display: inline-block; min-width: 0; min-height: 0; max-width: 100%; max-height: 100%; line-height: 0; }
        img { display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; min-width: 0; min-height: 0; }
      </style>
    </head>
    <body>
      <div class="screen" style="top: 0; height: 50vh;">
        <div class="wrapper" id="wrapper1"><img id="img1" src="https://fastly.picsum.photos/id/111/400/2000.jpg?hmac=X" /></div>
      </div>
      <div class="screen" style="top: 50vh; height: 50vh;">
        <div class="wrapper" id="wrapper2"><img id="img2" src="https://fastly.picsum.photos/id/111/2000/400.jpg?hmac=X" /></div>
      </div>
      <script>
        setTimeout(() => {
          const w1 = document.getElementById('wrapper1').getBoundingClientRect();
          const w2 = document.getElementById('wrapper2').getBoundingClientRect();
          console.log('wrapper1:', w1.width, 'x', w1.height);
          console.log('wrapper2:', w2.width, 'x', w2.height);
        }, 500);
      </script>
    </body>
    </html>
  `);
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
