// Drink cards (V3): shelf grid for customers, compact rows for management. Run: npx playwright test tests/cards.spec.js
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

// Every card shows its name and price inside the card at each width, including 641 to 768 px (200% zoom of 1280)
for (const width of [1280, 768, 700, 641, 375, 320]) {
  test(`customer cards at ${width} px show name and price, no overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await login(page, 'customer');
    const cards = page.locator('#drink_database .drink');
    await expect(cards.first()).toBeVisible();
    const bad = await cards.evaluateAll((l) => l.slice(0, 8).filter((c) => {
      const r = c.getBoundingClientRect();
      return [...c.querySelectorAll('.h4')].some((t) => { const b = t.getBoundingClientRect(); return !b.height || b.top < r.top || b.bottom > r.bottom; });
    }).length);
    expect(bad).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('customer shelf fills the width: 4 equal columns at 1280, 2 on a phone', async ({ page }) => {
  await login(page, 'customer');
  const row = () => page.locator('#drink_database .drink').evaluateAll((l) => {
    const top = l[0].getBoundingClientRect().top;
    return l.filter((c) => c.getBoundingClientRect().top === top).map((c) => Math.round(c.getBoundingClientRect().height));
  });
  const first = await row();
  expect(first.length).toBe(4);
  expect(new Set(first).size).toBe(1); // a stock badge never changes a card's height
  await page.setViewportSize({ width: 375, height: 800 });
  expect((await row()).length).toBe(2);
});

test('stock badges are translated and an out-of-stock card greys its bottle', async ({ page }) => {
  await login(page, 'customer', 1);
  const out = page.locator('#drink_database .drink.fade').first();
  await expect(out.locator('.out_stock')).toHaveText('Slut i lager');
  expect(await out.locator('img').evaluate((i) => getComputedStyle(i).filter)).toContain('grayscale');
  await page.click('#esp img');
  await expect(out.locator('.out_stock')).toHaveText('Agotado');
});

test('management cards are compact rows and printed in the current language', async ({ page }) => {
  await login(page, 'management', 1);
  const card = page.locator('#drink_database .drink').first();
  expect((await card.boundingBox()).height).toBeLessThanOrEqual(240);
  await expect(card.locator('.drink_name')).toHaveText('Namn:');
  await expect(card.locator('.inStock')).toHaveText('I lager:');
  await expect(card.locator('.add_one')).toHaveText('Tillägga +1');
});

test('management language switch keeps order-row prices', async ({ page }) => {
  await login(page, 'management');
  await page.locator('#drink_database .drink .add_one').first().click();
  const row = page.locator('#drink_selection .order .price').first();
  const before = await row.textContent();
  expect(before).toMatch(/^SEK \d+:-$/);
  await page.click('#esp img');
  await expect(row).toHaveText(before);
  await expect(page.locator('#drink_database .drink .price').first()).toHaveText(/Precio/);
});
