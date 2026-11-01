// Phone tests at 375x812 with touch (project "mobile"). Run: npx playwright test --project=mobile
const { test, expect } = require('@playwright/test');
const { axe } = require('./helpers');

// Staff buttons are hidden on phones (css/index.css), so click them in script like a tablet visitor would reach them
async function loginMobile(page, role, lang = 0) {
  await page.goto('/index.html');
  await page.evaluate((l) => localStorage.setItem('index', l), lang);
  await page.reload();
  await page.evaluate((id) => document.getElementById(id).click(), role);
  await page.fill('#user_name_input', 'test');
  await page.fill('#password_input', 'test');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/' + role + '.html');
  await page.waitForTimeout(800);
}

// Visible buttons and links smaller than min x min CSS px
const tooSmall = (page, min) => page.evaluate((min) => [...document.querySelectorAll('a[href], button, input:not([type=hidden])')]
  .filter((e) => { const b = e.getBoundingClientRect(), s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden'; })
  .map((e) => { const b = e.getBoundingClientRect(); return (e.id || e.className || e.textContent.trim().slice(0, 12)) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height); })
  .filter((t) => { const [w, h] = t.split(' ').pop().split('x').map(Number); return w < min || h < min; }), min);

const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('index: no sideways scroll, About and Passwords are labelled 44 px buttons, window fits', async ({ page }) => {
  await page.goto('/index.html');
  expect(await noScroll(page)).toBe(true);
  for (const id of ['about', 'passwords']) {
    const b = await page.locator('#' + id).boundingBox();
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(await page.locator('#' + id).evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
  }
  await page.tap('#passwords');
  const w = await page.locator('#passwords_window').boundingBox();
  expect(w.x).toBeGreaterThanOrEqual(0);
  expect(w.x + w.width).toBeLessThanOrEqual(375);
  expect((await page.locator('#passwords_window .close_window').boundingBox()).width).toBeGreaterThanOrEqual(44);
  await page.tap('#passwords_window .close_window');
  await page.tap('#customer');
  expect((await page.locator('#close').boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.locator('#user_name_input').evaluate((e) => getComputedStyle(e).fontSize)).toBe('16px');
  expect(await tooSmall(page, 24)).toEqual([]);
  await axe(page);
});

test('customer: category menu is a toggle that closes on pick and Escape', async ({ page }) => {
  await loginMobile(page, 'customer');
  const toggle = page.locator('#menu_toggle'), list = page.locator('#category_list');
  await expect(list).toBeHidden();
  await page.tap('#menu_toggle');
  await expect(list).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect((await page.locator('#category_list button').first().boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.tap('#category_list #beers');
  await expect(list).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#category_list #beers')).toHaveAttribute('aria-pressed', 'true');
  await page.tap('#menu_toggle');
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('customer: full order by touch, order toggle, undo/redo, 44 px remove', async ({ page }) => {
  await loginMobile(page, 'customer');
  expect(await noScroll(page)).toBe(true);
  await page.tap('.drink >> nth=0');
  await page.tap('.drink >> nth=1');
  const toggle = page.locator('#order_toggle'), sel = page.locator('#drink_selection');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sel).toBeHidden();
  await page.tap('#order_toggle');
  await expect(sel).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const x = await page.locator('.delete').first().boundingBox();
  expect(x.width).toBeGreaterThanOrEqual(44);
  expect(x.height).toBeGreaterThanOrEqual(44);
  const undo = await page.locator('#undo').boundingBox();
  expect(undo.width).toBeGreaterThanOrEqual(44);
  const before = await page.textContent('#total');
  await page.tap('#undo');
  expect(await page.textContent('#total')).not.toBe(before);
  await page.tap('#redo');
  expect(await page.textContent('#total')).toBe(before);
  await page.tap('#order_toggle');
  await expect(sel).toBeHidden();
  await page.tap('.pay_button');
  await expect(page.locator('.toast.is-open')).toBeVisible();
  expect(await tooSmall(page, 24)).toEqual([]);
  await axe(page);
});

test('bartender: rows are not clipped, tabs fit, footer targets are 44 px', async ({ page }) => {
  await loginMobile(page, 'bartender');
  expect(await noScroll(page)).toBe(true);
  expect(await page.locator('.accordion').evaluateAll((a) => a.filter((e) => [...e.children].some((c) => c.getBoundingClientRect().bottom > e.getBoundingClientRect().bottom + 1)).length)).toBe(0); // real content only: the top card's click extension (::after) overflows on purpose
  const tabs = await page.locator('.menu_tabs').boundingBox(), menu = await page.locator('.menu').boundingBox();
  expect(tabs.x + tabs.width).toBeLessThanOrEqual(menu.x + menu.width + 1);
  for (const sel of ['.menu li button', '#logout', '#undo', '#redo']) expect((await page.locator(sel).first().boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.locator('.accordion').first().tap();
  await expect(page.locator('.accordion').first()).toHaveAttribute('aria-expanded', 'true');
  expect(await tooSmall(page, 24)).toEqual([]);
  await axe(page);
});

test('management: has a viewport, stacks, Add buttons and footer are touch sized', async ({ page }) => {
  await loginMobile(page, 'management');
  expect(await page.evaluate(() => innerWidth)).toBe(375); // no viewport meta = 980
  expect(await noScroll(page)).toBe(true);
  expect(await page.locator('.drink').evaluateAll((a) => a.filter((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).length)).toBe(0);
  expect((await page.locator('.add_button').first().boundingBox()).height).toBeGreaterThanOrEqual(44);
  for (const sel of ['.menu li button', '#logout', '#pay', '#undo']) expect((await page.locator(sel).first().boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.locator('.add_button').first().tap();
  await expect(page.locator('.selection .order')).toHaveCount(1);
  expect((await page.locator('.delete').first().boundingBox()).width).toBeGreaterThanOrEqual(24);
  const pay = await page.locator('#pay').boundingBox();
  expect(pay.y).toBeLessThan(1400); // was 1785 before the compact stack
  expect(await tooSmall(page, 24)).toEqual([]);
  await axe(page);
});

// F6: Undo, Redo and Log Out keep their words at 320 px in Spanish; plates stay apart, inside the screen, 44 px high
for (const role of ['customer', 'bartender', 'management']) {
  test(`${role}: Log Out, Undo and Redo show their words at 320 px in Spanish`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await loginMobile(page, role, 3);
    expect(await noScroll(page)).toBe(true);
    const ids = ['#undo', '#redo', role === 'customer' ? '#logout_phone' : '#logout'];
    const boxes = [];
    for (const id of ids) {
      const el = page.locator(id), b = await el.boundingBox();
      expect(b.height, id).toBeGreaterThanOrEqual(44);
      expect(b.x, id).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width, id).toBeLessThanOrEqual(320);
      expect(await el.evaluate((e) => e.scrollWidth <= e.clientWidth), id + ' text fits').toBe(true);
      boxes.push(b);
    }
    expect(await page.locator('#undo .undo_label').evaluate((e) => e.getBoundingClientRect().width)).toBeGreaterThan(20);
    expect(await page.locator('#redo .redo_label').evaluate((e) => e.getBoundingClientRect().width)).toBeGreaterThan(20);
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      const a = boxes[i], c = boxes[j];
      expect(a.x + a.width <= c.x || c.x + c.width <= a.x || a.y + a.height <= c.y || c.y + c.height <= a.y, `${ids[i]} and ${ids[j]} overlap`).toBe(true);
    }
  });
}
