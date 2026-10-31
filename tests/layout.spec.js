// F5: page shell (one screen, only the lists scroll) and the rope-on-mast scrollbar
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

const ROLES = ['customer', 'bartender', 'management'];
const list = (role) => (role === 'bartender' ? '.order_list' : '.drink_list');
const sizes = [[1280, 800], [1920, 1080], [769, 700]];

for (const [w, h] of sizes) for (const role of ROLES) {
  test(`${role} ${w}x${h}: one screen, the list scrolls, the tab row has no scrollbar`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await login(page, role);
    const r = await page.evaluate((sel) => {
      const d = document.documentElement, l = document.querySelector(sel), f = document.querySelector('footer').getBoundingClientRect();
      return { x: d.scrollWidth - innerWidth, y: d.scrollHeight - innerHeight, listScrolls: l.scrollHeight > l.clientHeight, footerBottom: Math.round(f.bottom), menuOverflow: getComputedStyle(document.querySelector('.menu')).overflowY, innerHeight };
    }, list(role));
    expect(r.x).toBeLessThanOrEqual(0);
    expect(r.y).toBeLessThanOrEqual(0);
    if (role !== 'bartender' || h < 1000) expect(r.listScrolls).toBe(true); // the demo's piles fit a 1080 px table
    expect(r.footerBottom).toBe(r.innerHeight); // the footer sits on the bottom edge
    expect(r.menuOverflow).toBe('visible');
  });
}

test('bartender footer bar spans the page width', async ({ page }) => {
  await login(page, 'bartender');
  const b = await page.locator('footer').boundingBox();
  expect(b.x).toBe(0);
  expect(b.width).toBe(1280);
});

test('customer order list scrolls inside its column and the page stays one screen', async ({ page }) => {
  await login(page, 'customer');
  const cards = page.locator('#drink_database .drink:not(.fade)');
  for (let i = 0; i < 14; i++) await cards.nth(i).click();
  const r = await page.evaluate(() => { const s = document.querySelector('#drink_selection'), d = document.documentElement; return { scrolls: s.scrollHeight > s.clientHeight, y: d.scrollHeight - innerHeight }; });
  expect(r.scrolls).toBe(true);
  expect(r.y).toBeLessThanOrEqual(0);
});

for (const role of ROLES) {
  test(`${role}: under 600 px high the page scrolls and the list keeps its full height`, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 500 });
    await login(page, role);
    const r = await page.evaluate((sel) => { const l = document.querySelector(sel), d = document.documentElement; return { page: d.scrollHeight > innerHeight, listH: l.clientHeight, x: d.scrollWidth - innerWidth }; }, list(role));
    expect(r.page).toBe(true);
    expect(r.listH).toBeGreaterThan(400); // not squeezed to nothing
    expect(r.x).toBeLessThanOrEqual(0);
  });
}

test('scrollbars are a rope coil on a mast, 3:1 apart, with a Firefox fallback', async ({ page }) => {
  await page.goto('/index.html');
  const css = await page.evaluate(async () => (await fetch('css/style.css')).text());
  expect(css).toMatch(/::-webkit-scrollbar-track\s*\{[^}]*mast\.webp/);
  expect(css).toMatch(/::-webkit-scrollbar-thumb\s*\{[^}]*coil\.webp/);
  expect(css).toMatch(/@supports not selector\(::-webkit-scrollbar\)\s*\{\s*\*\s*\{\s*scrollbar-color: var\(--rope\) var\(--mast\)/);
  const ratio = await page.evaluate(async () => {
    const lum = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const avg = async (f) => {
      const img = new Image(); img.src = `img/textures/${f}.webp`; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
      for (let i = 0; i < d.length; i += 4) s += 0.2126 * lum(d[i]) + 0.7152 * lum(d[i + 1]) + 0.0722 * lum(d[i + 2]);
      return s / (d.length / 4);
    };
    const a = await avg('coil'), b = await avg('mast');
    return (a + 0.05) / (b + 0.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(3); // WCAG 1.4.11, thumb against track
});

// F6: Undo and Redo keep their words at every width, so the Spanish footer (the widest) must still fit one row
for (const w of [769, 800, 900, 1000, 1100, 1249]) {
  test(`customer ${w}px Spanish: footer fits with no sideways scroll`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await login(page, 'customer', 3);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator('#undo .undo_label').evaluate((e) => e.getBoundingClientRect().width)).toBeGreaterThan(20);
  });
}
