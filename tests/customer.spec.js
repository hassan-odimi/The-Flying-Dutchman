// Customer ordering, from docs/orca-checklist.md
const { test, expect } = require('@playwright/test');
const { login, startSR, heard, readAll, count, tabTo, axe } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await login(page, 'customer');
  await startSR(page);
});

test('one greeting heading with the credit after it', async ({ page }) => {
  const log = await readAll(page);
  expect(log.filter((p) => p.startsWith('heading') && /level 1/.test(p))).toEqual(['heading, Hello John!, level 1']);
  expect(log.indexOf('400')).toBeGreaterThan(log.indexOf('heading, Hello John!, level 1'));
});

test('category tabs say pressed and not pressed', async ({ page }) => {
  expect(await tabTo(page, /All/)).toBe('button, All, pressed');
  expect(await tabTo(page, /Beers/, 1)).toBe('button, Beers, not pressed');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toBe('button, Beers, pressed');
});

test('drink list is a named region and out-of-stock drinks are disabled', async ({ page }) => {
  const log = await readAll(page);
  expect(log).toContain('region, Drinks');
  expect(log).toContain('button, Chang Beer SEK 75:- OUT OF STOCK, disabled');
});

test('add, remove, undo and redo are each read once with the total', async ({ page }) => {
  await tabTo(page, /Heineken/);
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: Heineken added\. Total: SEK 50:-$/)).toBe(1);

  expect(await tabTo(page, /Remove/)).toBe('button, Remove Heineken');
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: Heineken removed\. Total: SEK 0:-$/)).toBe(1);
  await expect(page.locator('[id=pay]:visible')).toBeFocused(); // order now empty, so focus moves to Place Order

  await page.keyboard.press('Shift+Tab'); // Redo
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toBe('button, Undo, not disabled');
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: Undo\. Total: SEK 50:-$/)).toBe(1);

  expect(await tabTo(page, /Redo/, 2)).toBe('button, Redo, not disabled');
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: Redo\. Total: SEK 0:-$/)).toBe(1);
});

test('undo and redo start disabled', async ({ page }) => {
  const log = await readAll(page);
  expect(log).toContain('button, Undo, disabled');
  expect(log).toContain('button, Redo, disabled');
});

test('place order is confirmed once', async ({ page }) => {
  await tabTo(page, /Heineken/);
  await page.keyboard.press('Enter');
  await tabTo(page, /Place Order/);
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: /)).toBe(1);
});

test('announcements follow the Pirate language', async ({ page }) => {
  await login(page, 'customer', 4);
  await startSR(page);
  await tabTo(page, /Heineken/);
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: Heineken hauled aboard\./)).toBe(1);
});

test('axe: no violations at rest and in use', async ({ page }) => {
  await axe(page);
  await tabTo(page, /Heineken/);
  await page.keyboard.press('Enter');
  await tabTo(page, /Undo/);
  await page.keyboard.press('Enter');
  await axe(page);
});
