// Bartender order queue, from docs/orca-checklist.md
const { test, expect } = require('@playwright/test');
const { login, startSR, heard, count, tabTo, axe } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await login(page, 'bartender');
  await startSR(page);
});

test('tabs say pressed and not pressed', async ({ page }) => {
  expect(await tabTo(page, /All Orders/)).toBe('button, All Orders, pressed');
  expect(await tabTo(page, /Unpaid Orders/, 1)).toBe('button, Unpaid Orders, not pressed');
});

test('order rows expand and collapse', async ({ page }) => {
  expect(await tabTo(page, /ORDER #/)).toMatch(/, not expanded$/);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/, expanded$/);
});

test('buttons inside a collapsed order are not reachable', async ({ page }) => {
  await tabTo(page, /ORDER #/);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/ORDER #/);
});

test('order rows read without separator noise', async ({ page }) => {
  expect(await tabTo(page, /ORDER #/)).not.toMatch(/\||:::/);
});

test('mark as paid is confirmed once', async ({ page }) => {
  await tabTo(page, /ORDER #00020/);
  await page.keyboard.press('Enter');
  await tabTo(page, /Mark as Paid/, 5);
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: /)).toBe(1);
});

test('cancel order is confirmed once', async ({ page }) => {
  await tabTo(page, /ORDER #00020/);
  await page.keyboard.press('Enter');
  await tabTo(page, /Cancel Order/, 5);
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: /)).toBe(1);
});

test('axe: no WCAG 2.2 AA violations', async ({ page }) => {
  await axe(page);
});
