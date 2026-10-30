const { chromium } = require(process.cwd() + '/node_modules/@playwright/test');
const B = 'http://localhost:8080', OUT = process.argv[2], W = +(process.argv[3] || 1280);
async function login(page, role) {
  await page.goto(B + '/index.html'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('index', 0); }); await page.reload();
  await page.evaluate((id) => document.getElementById(id).click(), role);
  await page.fill('#user_name_input', 'test'); await page.fill('#password_input', 'test'); await page.keyboard.press('Enter'); await page.waitForURL('**/' + role + '.html'); await page.waitForTimeout(1500);
}
(async () => {
  const br = await chromium.launch(); const page = await br.newPage({ viewport: { width: W, height: 800 } });
  await page.goto(B + '/index.html'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('index', 0); }); await page.reload(); await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/index-${W}.png` });
  await page.evaluate(() => document.getElementById('customer').click()); await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/login-${W}.png` });
  for (const r of ['customer', 'bartender', 'management']) {
    await login(page, r); if (r === 'customer') { await page.locator('#drink_database .drink').first().click(); await page.mouse.move(0, 0); }
    await page.screenshot({ path: `${OUT}/${r}-${W}.png` });
  }
  await br.close();
})();
