import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #333; height: 100vh; display: flex; flex-direction: column; }
        
        .container { 
          flex: 1; min-height: 0; min-width: 0; 
          display: flex; align-items: center; justify-content: center; 
          background: #111; overflow: hidden; padding: 2rem; box-sizing: border-box; 
          border: 1px solid green; 
        }
        
        .wrapper { 
          position: relative; 
          display: flex; justify-content: center; align-items: center;
          max-width: 100%; max-height: 100%;
        }
        
        img { 
          display: block; 
          max-width: 100%; max-height: 100%; 
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="wrapper" id="w1">
          <img id="img1" src="https://fastly.picsum.photos/id/111/400/2000.jpg?hmac=X" />
        </div>
      </div>
      <div class="container">
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
          console.log('wrapper1:', w1.width, 'x', w1.height, 'img1:', i1.width, 'x', i1.height);
          console.log('wrapper2:', w2.width, 'x', w2.height, 'img2:', i2.width, 'x', i2.height);
        }, 1000);
      </script>
    </body>
    </html>
  `);
  
  await new Promise(r => setTimeout(r, 1500));
  await browser.close();
})();
