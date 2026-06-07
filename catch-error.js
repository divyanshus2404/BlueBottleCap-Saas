const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  // Wait for the Dashboard button and click it
  try {
    await page.waitForSelector('button:has-text("Dashboard")', { timeout: 5000 });
    // Assuming there is a text "Dashboard" in the navigation
    const [button] = await page.$x("//button[contains(., 'Dashboard')]");
    if (button) {
      await button.click();
    } else {
       console.log("Dashboard button not found");
    }
    await page.waitForTimeout(2000);
  } catch (e) {
    console.error("Navigation failed", e);
  }

  await browser.close();
})();
