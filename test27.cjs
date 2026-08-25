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
        
        .screen {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          padding: 2rem; box-sizing: border-box; overflow: hidden;
          border: 2px solid yellow;
        }
        
        .wrapper { 
          position: relative; 
          display: flex;
          min-width: 0; min-height: 0; max-width: 100%; max-height: 100%; 
        }
        
        img { 
          display: block; 
          max-width: 100%; max-height: 100%; 
          width: auto; height: auto; 
          min-width: 0; min-height: 0;
        }
        
      </style>
    </head>
    <body>
      <div class="screen">
        <div class="wrapper" id="wrapper">
          <img id="img" src="https://fastly.picsum.photos/id/111/2000/2000.jpg?hmac=X" />
        </div>
      </div>
      <script>
        setTimeout(() => {
          const wrapper = document.getElementById('wrapper');
          const img = document.getElementById('img');
          console.log('wrapper:', wrapper.getBoundingClientRect().width, 'x', wrapper.getBoundingClientRect().height);
          console.log('img:', img.getBoundingClientRect().width, 'x', img.getBoundingClientRect().height);
        }, 500);
      </script>
    </body>
    </html>
  `);
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
