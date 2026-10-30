// Tabs, slips and buttons (V4): paper, brass and iron textures. Run: npx playwright test tests/textures.spec.js
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

const style = (loc, prop) => loc.evaluate((e, p) => getComputedStyle(e)[p], prop);

test('category tabs are torn notes; the active one is the board it sits on', async ({ page }) => {
  await login(page, 'customer');
  const active = page.locator('.menu button[aria-pressed="true"]');
  const other = page.locator('.menu button[aria-pressed="false"]').first();
  expect(await style(other, 'backgroundImage')).toContain('tab-note');
  expect(await style(active, 'backgroundImage')).toContain('board-surface');
  expect(await style(other, 'height')).toBe('36px');
  await other.hover();
  await expect.poll(() => style(other, 'height')).toBe('38px'); // peeks up on hover, still below the active 40px
  expect(await style(active, 'height')).toBe('40px');
});

test('bartender: wide notes, kelp board, and new orders stay a solid red alarm', async ({ page }) => {
  await login(page, 'bartender');
  expect(await style(page.locator('#paid'), 'backgroundImage')).toContain('tab-note-wide');
  expect(await style(page.locator('.menu button[aria-pressed="true"]'), 'backgroundImage')).toContain('board-kelp');
  await page.evaluate(() => document.getElementById('retrieve_orders').classList.add('has-new'));
  const alarm = page.locator('#retrieve_orders');
  expect(await style(alarm, 'backgroundImage')).toBe('none');
  expect(await style(alarm, 'backgroundColor')).toBe('rgb(200, 16, 46)');
});

test('the paper behind every label is light enough for sepia text at 5:1', async ({ page }) => {
  await page.goto('/index.html');
  // label zones: tabs below the torn top band, slips between the nail and the torn bottom
  const files = [1, 2, 3].flatMap((i) => [[`tab-note${i}`, 0.05, 0.2, 0.95, 1], [`tab-note-wide${i}`, 0.05, 0.2, 0.95, 1]])
    .concat([1, 2].map((i) => [`slip${i}`, 0.06, 0.13, 0.94, 0.94]), [['paper-list', 0, 0, 1, 1]]);
  const darkest = await page.evaluate(async (files) => {
    const lum = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const out = {};
    for (const [f, x0, y0, x1, y1] of files) {
      const img = new Image(); img.src = `img/textures/${f}.webp`; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(Math.round(x0 * c.width), Math.round(y0 * c.height), Math.round((x1 - x0) * c.width), Math.round((y1 - y0) * c.height)).data;
      let min = 1;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 250) min = Math.min(min, 0.2126 * lum(d[i]) + 0.7152 * lum(d[i + 1]) + 0.0722 * lum(d[i + 2]));
      out[f] = min;
    }
    return out;
  }, files);
  const sepia = 0.2126 * 0.0232 + 0.7152 * 0.0086 + 0.0722 * 0.0027; // --ink-sepia #2a1709
  for (const [f, l] of Object.entries(darkest)) expect((l + 0.05) / (sepia + 0.05), f).toBeGreaterThanOrEqual(5);
});

test('About and Passwords are slips nailed to the top edge at 1280, fully on screen', async ({ page }) => {
  await page.goto('/index.html');
  for (const id of ['#about', '#passwords']) {
    const b = await page.locator(id).boundingBox();
    expect(b.y).toBeLessThanOrEqual(2);
    expect(b.x + b.width).toBeLessThanOrEqual(1280);
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(160);
    expect(await style(page.locator(id), 'backgroundImage')).toContain('slip');
  }
});

test('buttons darken on hover and sink when pressed; Log Out stays a quiet outline', async ({ page }) => {
  await login(page, 'customer');
  await page.locator('#drink_database .drink').first().click();
  const pay = page.locator('#pay.small_button');
  expect(await style(pay, 'backgroundImage')).toMatch(/rivet.*tarnish/);
  await pay.hover();
  await expect.poll(() => style(pay, 'filter')).toContain('brightness');
  const b = await pay.boundingBox();
  await page.mouse.down();
  await expect.poll(() => style(pay, 'transform')).toBe('matrix(1, 0, 0, 1, 0, 1)');
  await page.mouse.up();
  await page.mouse.move(b.x - 200, b.y - 200);
  const out = page.locator('footer #logout');
  expect(await style(out, 'backgroundImage')).toBe('none');
  expect(await style(out, 'borderTopWidth')).toBe('2px');
});

test('small plates: rusty brass and rust-red buttons, and Add +1 darkens and sinks', async ({ page }) => {
  await login(page, 'bartender');
  await page.evaluate(() => document.querySelector('.checkout').closest('.panel').previousElementSibling.click());
  const row = page.locator('.checkout').filter({ visible: true }).first();
  for (const [sel, layers] of [['.cancel_order', /rust.*tarnish/], ['.mark_paid', /rust.*tarnish/]]) {
    const bg = await style(row.locator(sel), 'backgroundImage');
    expect(bg).toMatch(layers);
    expect(bg).not.toContain('rivet');
  }
  await login(page, 'management');
  const add = page.locator('.add_button').first(), plate = add.locator('.h4');
  expect(await style(plate, 'backgroundImage')).toMatch(/rust.*tarnish/);
  await add.hover();
  await expect.poll(() => style(plate, 'filter')).toContain('brightness');
  await page.mouse.down();
  await expect.poll(() => style(plate, 'transform')).toBe('matrix(1, 0, 0, 1, 0, 1)');
  await page.mouse.up();
});

test('phone category menu: one paper sheet inside its box, the active item on the board', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await login(page, 'customer');
  await page.click('#menu_toggle');
  const list = page.locator('#category_list');
  expect(await style(list, 'backgroundImage')).toContain('paper-list');
  expect(await style(list, 'borderTopWidth')).toBe('0px');
  const box = await list.boundingBox();
  for (const b of await list.locator('button').all()) {
    const r = await b.boundingBox();
    expect(r.x + r.width).toBeLessThanOrEqual(box.x + box.width + 0.5); // no row or rule runs past the sheet
    if (await b.getAttribute('aria-pressed') === 'false') expect(await style(b, 'color')).toBe('rgb(42, 23, 9)');
  }
  await list.locator('#beers').click();
  await page.click('#menu_toggle');
  const beers = list.locator('#beers');
  expect(await style(beers, 'backgroundImage')).toContain('board-surface');
  expect(await style(beers, 'color')).toBe('rgb(0, 0, 0)');
});

test('About and Passwords open as opaque parchment nailed at the top, with the iron Close', async ({ page }) => {
  await page.goto('/index.html');
  for (const id of ['about', 'passwords']) {
    await page.click('#' + id);
    const win = page.locator(`#${id}_window`), close = win.locator('.close_window');
    await expect(win).toBeVisible();
    expect(await style(win, 'backgroundImage')).toMatch(/rivet.*rivet.*paper-list/);
    expect(await style(win, 'backgroundColor')).toBe('rgb(255, 255, 255)'); // opaque under the paper: nothing shows through
    expect(await style(win, 'color')).toBe('rgb(42, 23, 9)');
    expect(await style(close, 'backgroundImage')).toContain('iron');
    const b = await close.boundingBox();
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.y).toBeGreaterThanOrEqual((await win.boundingBox()).y + 30); // below the nails
    await close.click();
  }
  await page.click('#about');
  const link = page.locator('#about_window a');
  await link.hover();
  expect(await style(link, 'color')).toBe('rgb(42, 23, 9)');
  expect(await style(link, 'textDecorationLine')).toBe('underline');
});

test('login box: wood2 planks with iron corners, Oswald fields, and "Order your Drinks!" hides while it is open', async ({ page }) => {
  await page.goto('/index.html');
  const order = page.locator('#customer');
  await expect(order).toBeVisible();
  await order.click();
  const box = page.locator('#loginBox');
  await expect(box).toBeVisible();
  expect(await style(box, 'backgroundImage')).toContain('wood2');
  expect(await style(box, 'backgroundImage')).not.toContain('wood3');
  expect(await style(box, 'borderImageSource')).toContain('iron-frame');
  expect(await style(page.locator('#user_name_input'), 'fontFamily')).toContain('Oswald');
  expect(await style(order, 'visibility')).toBe('hidden'); // no edge of it peeks out under the box
  await page.click('#close');
  await expect(order).toBeVisible();
});

test('landing signs: brass "Order your Drinks!" stays on its plate, staff logins are iron at 16 px', async ({ page }) => {
  await page.goto('/index.html');
  const order = page.locator('#customer');
  expect(await style(order, 'backgroundImage')).toContain('tarnish');
  expect(await style(order, 'backgroundImage')).toContain('rivet');
  const b = await order.boundingBox();
  expect(b.height).toBeGreaterThanOrEqual(44);
  expect(await order.evaluate((e) => e.scrollHeight <= e.clientHeight)).toBe(true); // a wrapped "Drinks!" stays on the brass
  const staff = page.locator('#bartender');
  if (await staff.isVisible()) {
    expect(await style(staff, 'backgroundImage')).toContain('iron');
    expect(await style(staff, 'fontSize')).toBe('16px');
  }
});

test('staff label: role icon and gold swash name on the wood, no plate, clear of the heading', async ({ page }) => {
  for (const [role, icon, heading] of [['bartender', 'beer', '#orders_q'], ['management', 'ship-wheel', '#title']]) {
    await login(page, role);
    const info = page.locator('.info');
    expect(await info.locator('use').getAttribute('href')).toBe('img/icons.svg#' + icon);
    expect(await style(info, 'boxShadow')).toBe('none'); // raised plates are buttons; this is not one
    expect(await style(info.locator('span'), 'fontFamily')).toContain('Berkshire Swash');
    const a = await info.boundingBox(), h = await page.locator(heading).evaluate((e) => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect().toJSON(); });
    expect(a.y + a.height <= h.top || a.x + a.width <= h.left || h.right <= a.x).toBe(true);
  }
});

test('order panel: paper ledger, a note in the language while empty, one ruled grid row per drink', async ({ page }) => {
  await login(page, 'customer');
  const panel = page.locator('#drink_selection');
  expect(await style(panel, 'backgroundImage')).toContain('paper-list');
  const note = () => panel.evaluate((e) => getComputedStyle(e, '::before').content);
  expect(await note()).toBe('"Nothing ordered yet. Choose a drink to add it."');
  if (await page.locator('#order_toggle').isVisible()) await page.click('#order_toggle');
  await page.locator('#drink_database .drink:not([disabled])').first().click();
  await expect(panel.locator('.order')).toHaveCount(1);
  expect(await note()).toBe('none'); // the note goes once a drink is on the order
  expect(await style(panel.locator('.order'), 'display')).toBe('grid');
  await panel.locator('.delete').click();
  expect(await note()).toContain('Nothing ordered yet'); // and comes back when it is removed
  await login(page, 'customer', 1);
  expect(await note()).toContain('Inget beställt');
});

test('bartender: paper order bars show their state, the open order is a pinned docket, TOTAL is text', async ({ page }) => {
  await login(page, 'bartender');
  const open = page.locator('.accordion.order_open').first(), paid = page.locator('.accordion.order_paid').first();
  await expect(open.locator('.o_state')).toHaveText('Not paid');
  await expect(paid.locator('.o_state')).toContainText('Paid by');
  expect(await style(open, 'boxShadow')).not.toBe('none'); // not paid stays raised
  expect(await style(paid, 'boxShadow')).toBe('none');      // paid lies flat, torn and folded
  expect(await style(paid, 'maskImage')).toContain('torn-edge');
  await open.click();
  const docket = page.locator('.accordion.active + .panel');
  expect(await style(docket, 'backgroundImage')).toMatch(/tack.*docket/);
  await expect(docket.locator('.docket_head b')).toHaveText(/^#\d+$/);
  await expect(docket.locator('.order_details .qty').first()).toHaveText(/^\d+×$/);
  expect(await style(docket.locator('.total'), 'boxShadow')).toBe('none'); // can't be clicked, so no plate
  await expect(docket.getByRole('button')).toHaveCount(2);                  // only Cancel and Mark as Paid
});

test('toasts are burnt notes pinned with a tack; sea mist rolls in under them; errors add a red ribbon', async ({ page }) => {
  await login(page, 'customer');
  const toast = page.locator('#toast'), mist = () => page.locator('.toast_wrap').evaluate((e) => +getComputedStyle(e, '::before').opacity);
  expect(await style(toast, 'borderImageSource')).toContain('note');
  expect(await toast.evaluate((e) => getComputedStyle(e, '::after').backgroundImage)).toContain('tack');
  expect(await mist()).toBe(0);
  await page.locator('#pay:visible, #pay_phone:visible').click(); // empty order
  await expect(toast).toHaveClass(/is-error/);
  await expect.poll(mist).toBeGreaterThan(0.9);
  expect(await toast.evaluate((e) => getComputedStyle(e, '::before').maskImage)).toContain('stamp-wear'); // worn red ribbon
  await expect(toast.locator('use')).toHaveAttribute('href', /#alert$/);
  expect(await page.locator('.toast_wrap').evaluate((e) => getComputedStyle(e, '::before').pointerEvents)).toBe('none');
});

test('order rows: tally first, a red brush cross that strikes its row on focus, total in gold, one id per Place Order', async ({ page }) => {
  await login(page, 'customer');
  const drink = page.locator('#drink_database .drink:not([disabled])');
  await drink.nth(0).click(); await drink.nth(1).click(); await drink.nth(1).click();
  const panel = page.locator('#drink_selection');
  if (!(await panel.isVisible())) await page.click('#order_toggle');
  const row = panel.locator('.order').first(); // the newest row is on top
  await expect(row.locator('.qty')).toHaveText('2×');
  await expect(row.locator('h4').first()).not.toContainText('x');
  await expect(row.locator('.delete use')).toHaveAttribute('href', 'img/icons.svg#cross-brush');
  expect(await style(row.locator('.delete'), 'backgroundColor')).toBe('rgba(0, 0, 0, 0)'); // ink, no plate
  const strike = () => row.evaluate((e) => getComputedStyle(e, '::after').maskSize);
  expect(await strike()).toMatch(/^0%/);
  await row.locator('.delete').focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); // keyboard focus
  await expect.poll(strike).toBe('100% 100%');
  await expect(page.locator('#total small')).toHaveText('Total:');
  await expect(page.locator('#total span')).toHaveText(/^SEK \d+:-$/);
  expect(await page.locator('[id=pay]').count()).toBe(1);
  await login(page, 'customer', 1);
  await expect(page.locator('#total small')).toHaveText('Totalt:');
});

test('header and footer: coin credit label, swash staff titles, flags sewn on a sagging cord between two nails', async ({ page }) => {
  await login(page, 'customer');
  const credit = page.locator('#creditDisplay');
  await expect(credit).toBeVisible(); // on phones too
  await expect(credit.locator('img.coin')).toHaveAttribute('alt', '');
  await expect(credit).toHaveText(/^Credit: SEK \d+:-$/);
  expect(await style(credit, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)'); // a label, no plate
  const h = await page.locator('.welcome h1').boundingBox(), c = await credit.boundingBox();
  expect(h.x + h.width <= c.x || h.y + h.height <= c.y).toBe(true); // never under the greeting
  expect(await page.locator('[id=logout]').count()).toBe(1);
  const menu = page.locator('footer .languages_menu');
  expect(await menu.evaluate((e) => getComputedStyle(e, '::before').backgroundImage)).toContain('rope.webp');
  expect(await menu.evaluate((e) => getComputedStyle(e, '::after').backgroundImage)).toMatch(/nail.*nail/);
  const flags = menu.locator('img');
  for (const n of ['eng', 'sve', 'ita', 'esp', 'pirate']) await expect(flags.and(page.locator(`[src$="flag-${n}.webp"]`))).toHaveCount(1);
  const tops = await flags.evaluateAll((l) => l.map((i) => i.getBoundingClientRect().y));
  expect(tops[2]).toBeGreaterThan(tops[0]); // the middle flag hangs lowest, with the cord
  expect(Math.abs(tops[0] - tops[4])).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  await login(page, 'customer', 4);
  await expect(page.locator('#your_credit')).toHaveText('Doubloons:');
  await login(page, 'bartender');
  expect(await style(page.locator('#orders_q'), 'fontFamily')).toContain('Berkshire Swash');
});
