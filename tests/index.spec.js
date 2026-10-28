// Landing page and login, from docs/orca-checklist.md
const { test, expect } = require('@playwright/test');
const { startSR, heard, readAll, count, tabTo, axe } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await startSR(page);
});

test('logo is read by name', async ({ page }) => {
  expect(await readAll(page)).toContain('image, The Flying Dutchman');
});

test('side panel buttons read without a stray "<"', async ({ page }) => {
  await tabTo(page, /About this project/);
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toBe('button, About this project');
  await tabTo(page, /Get the passwords/);
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toBe('button, Get the passwords');
});

test('passwords panel opens and closes from the keyboard', async ({ page }) => {
  await tabTo(page, /Get the passwords/);
  await page.keyboard.press('Enter');
  expect(await tabTo(page, /Close/, 3)).toBe('button, Close');
  await page.keyboard.press('Enter');
  await expect(page.locator('#passwords_window')).toBeHidden();
});

test('login fields are labelled and a wrong password is read once', async ({ page }) => {
  await tabTo(page, /Order your Drinks/);
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/^textbox, User name/); // focus moves into the dialog
  await page.keyboard.type('test');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toBe('Password'); // Guidepup gives password inputs no role
  await page.keyboard.type('wrong');
  await heard(page);
  await page.keyboard.press('Enter');
  const log = await heard(page);
  expect(count(log, /Wrong password/i)).toBe(1);
  // Guidepup does not voice aria-invalid, so check it and the error description directly
  await expect(page.locator('#password_input')).toHaveAttribute('aria-invalid', 'true');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/Wrong password/);
});

test('flags are named in their own language and switch lang', async ({ page }) => {
  expect(await tabTo(page, /English/)).toBe('link, English, current item');
  expect(await tabTo(page, /Svenska/, 1)).toBe('link, Svenska');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
  await expect(page.locator('#sve')).toHaveAttribute('aria-current', 'true');
});

test('axe: no WCAG 2.2 AA violations', async ({ page }) => {
  await axe(page);
});

test('closed toast does not block clicks on Order your Drinks', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 }); // common laptop height, where the toast area overlaps the button
  await page.click('#customer', { timeout: 3000 });
  await expect(page.locator('#loginBox')).toBeVisible();
});
