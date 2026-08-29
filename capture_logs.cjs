const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // click 'I am an Admin' if we are not admin yet
  const adminBtn = await page.$('text=I am an Admin');
  if (adminBtn) await adminBtn.click();
  
  await page.waitForTimeout(1000);
  // Add a project
  const addBtn = await page.$('text=Add New Project');
  if (addBtn) {
      console.log('Adding project');
      await addBtn.click();
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="Project Name"]', 'Test Project');
      await page.fill('input[placeholder="Client Name"]', 'Test Client');
      await page.fill('input[placeholder="Location (e.g. London, UK)"]', 'London, UK');
      await page.click('text=Create Project');
      await page.waitForTimeout(1000);
  }
  
  // Click the project card
  const cards = await page.$$('.relative.group.h-full.cursor-pointer');
  if (cards.length > 0) {
      console.log('Clicking a project card...');
      await cards[0].click();
      await page.waitForTimeout(2000);
  } else {
      console.log('No project cards found after adding.');
  }

  await browser.close();
})();
