const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://dbdocs.io/Holistics/Ecommerce?table=users&schema=core&view=table_structure', { waitUntil: 'networkidle2' });
  const html = await page.content();
  fs.writeFileSync('dbdocs-source.html', html);
  await browser.close();
  console.log('Scraping completed');
})();
