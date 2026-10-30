// Colours live in :root of css/style.css only. Run: npx playwright test tests/theme.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { login } = require('./helpers');

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

test('font sizes and weights come from the V1 scale tokens', () => {
  for (const f of fs.readdirSync('css').filter((n) => n.endsWith('.css'))) {
    let s = stripComments(fs.readFileSync('css/' + f, 'utf8')).replace(/:root\s*\{[^}]*\}/g, '');
    const sizes = [...s.matchAll(/font-size:\s*([^;}]+)/g)].map((m) => m[1].trim());
    expect(sizes.filter((v) => !/^var\(--text-[a-z]+\)$/.test(v)), f + ' font-size').toEqual([]);
    const weights = [...s.matchAll(/font-weight:\s*([^;}]+)/g)].map((m) => m[1].trim());
    expect(weights.filter((v) => !/^var\(--weight-[a-z]+\)$/.test(v)), f + ' font-weight').toEqual([]);
  }
  for (const f of ['index', 'customer', 'bartender', 'management']) {
    expect(fs.readFileSync(f + '.html', 'utf8').match(/font-weight:\s*bold/), f + '.html').toBeNull();
  }
});

test('Oswald loads real 400 to 700 weights and the browser never fakes bold', async ({ page }) => {
  await page.goto('/index.html');
  const faces = await page.evaluate(async () => (await document.fonts.load('600 16px Oswald', 'Abc'))
    .map((f) => f.family.replace(/"/g, '') + ' ' + f.weight));
  expect(faces).toContain('Oswald 400 700'); // one variable face, so 500 and 600 are drawn, not faked
  expect(await page.evaluate(() => getComputedStyle(document.body).fontSynthesisWeight)).toBe('none');
});

test('corners and shadows come from the V2 material tokens', () => {
  for (const f of fs.readdirSync('css').filter((n) => n.endsWith('.css'))) {
    const s = stripComments(fs.readFileSync('css/' + f, 'utf8')).replace(/:root\s*\{[^}]*\}/g, '');
    const radii = [...s.matchAll(/radius:\s*([^;}]+)/g)].map((m) => m[1].trim());
    expect(radii.filter((v) => !/^(0|var\(--radius-[a-z]+\))( (0|var\(--radius-[a-z]+\)))*$/.test(v)), f + ' radius').toEqual([]);
    const shadows = [...s.matchAll(/box-shadow:\s*([^;}]+)/g)].map((m) => m[1].trim());
    expect(shadows.filter((v) => !/^var\(--shadow-[a-z]+\)$/.test(v) && v !== '0 0 0 6px var(--ink)'), f + ' box-shadow').toEqual([]); // the focus ring is not a lift
  }
});

for (const role of ['customer', 'bartender', 'management']) {
  test(`${role}: one scrimmed wood, and text on it is Sail White`, async ({ page }) => {
    await login(page, role);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).toMatch(/linear-gradient.*wood2\.jpg/);
    const offWhite = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => {
      if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || !e.getClientRects().length) return false;
      for (let a = e; a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.backgroundImage !== 'none') return false; // sits on a panel, axe checks it
      }
      return getComputedStyle(e).color !== 'rgb(255, 255, 255)';
    }).map((e) => e.textContent.trim()));
    expect(offWhite).toEqual([]);
  });
}
