// Management stock, from docs/orca-checklist.md
const { test, expect } = require('@playwright/test');
const { login, startSR, heard, count, tabTo, axe } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await login(page, 'management');
  await startSR(page);
});

test('tabs say pressed and not pressed', async ({ page }) => {
  expect(await tabTo(page, /Full Drinks List/)).toBe('button, Full Drinks List, pressed');
  expect(await tabTo(page, /Check Bar Stock/, 1)).toBe('button, Check Bar Stock, not pressed');
});

test('add buttons say which drink they are for', async ({ page }) => {
  expect(await tabTo(page, /Add \+1/)).toMatch(/Braastad XO/);
  expect(await tabTo(page, /Add \+10/, 1)).toMatch(/Braastad XO/);
  expect(await tabTo(page, /Add \+100/, 1)).toMatch(/Braastad XO/);
});

test('each add is read once', async ({ page }) => {
  await tabTo(page, /Add \+10/);
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: Braastad XO added\./)).toBe(1);
});

test('place stock order is confirmed once and keeps focus', async ({ page }) => {
  await tabTo(page, /Add \+1/);
  await page.keyboard.press('Enter');
  await page.focus('#pay');
  await heard(page);
  await page.keyboard.press('Enter');
  expect(count(await heard(page), /^polite: /)).toBe(1);
  await expect(page.locator('#pay')).toBeFocused();
});

test('axe: no WCAG 2.2 AA violations at rest and in use', async ({ page }) => {
  await axe(page);
  await tabTo(page, /Add \+1/);
  await page.keyboard.press('Enter');
  await axe(page);
});
