const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
     console.log('PAGE LOG:', msg.type(), msg.text());
  });
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  
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
    console.log("BODY TEXT:\n", bodyText.substring(0, 500));

    // Save screenshot
    await page.screenshot({ path: 'error_screenshot.png' });
    
  } catch (e) {
    console.error("Script failed", e);
  }

  await browser.close();
  process.exit(0);
})();
