const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Disable vite error overlay so we can see the DOM
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0', timeout: 10000 });
  
  // Wait a sec for websocket or state to load
  await new Promise(r => setTimeout(r, 2000));
  
  const rootHtml = await page.evaluate(() => document.getElementById('root') ? document.getElementById('root').innerHTML : 'No root element');
  console.log('--- ROOT HTML ---');
  console.log(rootHtml.substring(0, 1000));
  
  await browser.close();
})();
