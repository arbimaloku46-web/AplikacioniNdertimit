import puppeteer from 'puppeteer';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  await delay(2000);
  
  // Click on the first project
  const projectCards = await page.$$('.group.bg-slate-900\\/40');
  if (projectCards.length > 0) {
    console.log('Found project card, clicking...');
    await projectCards[0].click();
    await delay(2000);
  } else {
    console.log('No project cards found on home page.');
  }
  
  await browser.close();
})();
