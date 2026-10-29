// Colours live in :root of css/style.css only. Run: npx playwright test tests/theme.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const LITERAL = /#[0-9a-fA-F]{3,6}\b|rgba?\(|hsla?\(|:\s*(white|black|red|green|grey|gray|whitesmoke|lightgrey|darkgray)\b/;

test('no colour literals outside :root in the CSS or in .css() calls in the JS', () => {
  for (const f of fs.readdirSync('css').filter((n) => n.endsWith('.css'))) {
    let s = stripComments(fs.readFileSync('css/' + f, 'utf8'));
    if (f === 'style.css') s = s.replace(/:root\s*\{[^}]*\}/g, '');
    expect(s.match(LITERAL), f).toBeNull();
  }
  for (const f of ['index', 'customer', 'bartender', 'management']) {
    expect(fs.readFileSync(`js/${f}.js`, 'utf8').match(/\.css\([^)]*#[0-9a-fA-F]{3,6}/), f).toBeNull();
  }
});

test('active tab follows --surface, so the theme changes in one place', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.setItem('index', 0));
  await page.reload();
  await page.focus('#management');
  await page.keyboard.press('Enter');
  await page.fill('#user_name_input', 'test');
  await page.fill('#password_input', 'test');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/management.html');
  const bg = (sel) => page.locator(sel).evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg('#drinks_list')).toBe('rgb(164, 185, 182)');
  await page.evaluate(() => document.documentElement.style.setProperty('--surface', 'rgb(1, 2, 3)'));
  expect(await bg('#drinks_list')).toBe('rgb(1, 2, 3)');
  expect(await bg('#check_stock')).not.toBe('rgb(1, 2, 3)');
});
