const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
     if (msg.type() === 'error') {
        console.error('PROD PAGE ERROR LOG:', msg.text());
     }
  });
  page.on('pageerror', error => console.error('PROD PAGE ERROR:', error.message));
  
  await page.goto('https://bluebottlecap.com/');
  
  try {
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Switch to Dashboard
    await page.evaluate(() => {
       const dashboardBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dashboard'));
       if (dashboardBtn) {
         dashboardBtn.click();
       } else {
         const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start Studying'));
         if (startBtn) startBtn.click();
       }
    });

    await new Promise(r => setTimeout(r, 2000));
    
    // Try again
    await page.evaluate(() => {
       const dashboardBtn = Array.from(document.querySelectorAll('button, a, div')).find(b => b.textContent && b.textContent.trim() === 'Dashboard');
       if (dashboardBtn) {
         dashboardBtn.click();
       }
    });

    await new Promise(r => setTimeout(r, 2000));
    
    // Grab text content of body
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("PROD BODY TEXT:\n", bodyText.substring(0, 500));
    
  } catch (e) {
    console.error("Script failed", e);
  }

  await browser.close();
  process.exit(0);
})();
