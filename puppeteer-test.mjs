import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message, error.stack));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log("Clicking About button...");
  // The About button should have text "About"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aboutBtn = buttons.find(b => b.textContent.includes('About'));
    if (aboutBtn) {
      aboutBtn.click();
    } else {
      console.log("ABOUT BUTTON NOT FOUND!");
    }
  });

  await new Promise(r => setTimeout(r, 2000));
  console.log("Done");
  await browser.close();
})();
