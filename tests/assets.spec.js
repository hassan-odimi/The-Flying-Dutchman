// Images: every file used and recorded, drinks light and lazy. Run: npx playwright test tests/assets.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { login } = require('./helpers');

const code = ['index', 'customer', 'bartender', 'management'].map((f) => fs.readFileSync(f + '.html', 'utf8'))
  .concat(fs.readdirSync('css').map((f) => fs.readFileSync('css/' + f, 'utf8')))
  .concat(fs.readdirSync('js').filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync('js/' + f, 'utf8')))
  .join('\n');
const db = ['DB', 'DB_SYSTEMBOLAGET', 'DB_MIKES'].map((f) => fs.readFileSync(`db/${f}.js`, 'utf8')).join('\n');
const ids = new Set([...db.matchAll(/"(?:artikelid|article_id)"\s*:\s*"(\w+)"/g)].map((m) => m[1]));

test('every image outside drinks is used by the code and recorded in docs/ASSETS.md', () => {
  const assets = fs.readFileSync('docs/ASSETS.md', 'utf8');
  for (const f of ['', 'logo/'].flatMap((d) => fs.readdirSync('img/' + d, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => d + e.name))) {
    expect(code.includes('img/' + f), f + ' used').toBe(true);
    expect(assets.includes(f), f + ' recorded').toBe(true);
  }
});

test('every page uses the brass anchor favicon, once, with a PNG fallback', () => {
  for (const f of ['index', 'customer', 'bartender', 'management']) {
    const html = fs.readFileSync(f + '.html', 'utf8');
    expect(html.match(/<link rel="icon"[^>]*favicon\.svg/g), f).toHaveLength(1);
    expect(html.match(/<link rel="icon"[^>]*favicon\.png/g), f).toHaveLength(1);
  }
});

test('one small WebP per drink in the database, no orphans', () => {
  const files = fs.readdirSync('img/drinks');
  expect(files.filter((f) => !f.endsWith('.webp'))).toEqual([]);
  expect(files.map((f) => f.slice(0, -5)).sort()).toEqual([...ids].sort());
  expect(files.filter((f) => fs.statSync('img/drinks/' + f).size > 60000)).toEqual([]); // 400 px tall, q82: largest is 39 KB
});

test('customer loads only the drink images near the screen', async ({ page }) => {
  let loaded = 0;
  page.on('response', (r) => { if (r.url().includes('/img/drinks/')) loaded++; });
  await login(page, 'customer');
  await page.waitForLoadState('networkidle');
  const imgs = page.locator('#drink_database img');
  expect(await imgs.count()).toBeGreaterThan(40);
  expect(await imgs.evaluateAll((l) => l.every((i) => i.loading === 'lazy'))).toBe(true);
  expect(loaded).toBeLessThan((await imgs.count()) * 0.6); // V3's 4-column shelf puts about half inside Chromium's lazy-load margin
  expect(await imgs.first().evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
});

test('icons come from the local Lucide sprite: no icon font, no letter icons, every symbol exists', () => {
  const sprite = fs.readFileSync('img/icons.svg', 'utf8');
  expect(code).not.toMatch(/font-awesome|class="fa |>X</);
  for (const [, name] of code.matchAll(/icons\.svg#([\w-]+)/g)) expect(sprite, name).toContain(`<symbol id="${name}" viewBox="0 0 24 24">`); // the space matters: without it the symbol is invalid XML and the whole sprite fails
});

test('order rows remove with the brush cross; flags keep their 1.6 ratio', async ({ page }) => {
  let sprite = 0;
  page.on('response', (r) => { if (r.url().endsWith('/img/icons.svg')) sprite = r.status(); });
  await login(page, 'customer');
  await page.locator('#drink_database .drink').first().click();
  await expect(page.locator('#drink_selection .delete use').first()).toHaveAttribute('href', 'img/icons.svg#cross-brush');
  expect(sprite).toBe(200);
  for (const box of await page.locator('.languages img').evaluateAll((l) => l.map((i) => [i.width / i.height, i.naturalWidth / i.naturalHeight]))) {
    expect(box[0]).toBeCloseTo(1.6, 1);
    expect(box[1]).toBeCloseTo(1.6, 2);
  }
});
