// Tabs, slips and buttons (V4): paper, brass and iron textures. Run: npx playwright test tests/textures.spec.js
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

const style = (loc, prop) => loc.evaluate((e, p) => getComputedStyle(e)[p], prop);

test('category tabs: idle notes dim, hover is clean paper, the selected note is warm, pulled forward and tacked', async ({ page }) => {
  await login(page, 'customer');
  const active = page.locator('.menu button[aria-pressed="true"]');
  const other = page.locator('.menu button[aria-pressed="false"]').first();
  expect(await style(other, 'backgroundImage')).toContain('tab-note');
  expect(await style(active, 'backgroundImage')).toContain('tab-note'); // keeps its own torn note, no board
  expect(await style(other, 'filter')).toContain('brightness(0.95)');
  expect(await style(other, 'height')).toBe('36px');
  await other.hover();
  await expect.poll(() => style(other, 'height')).toBe('38px'); // peeks up on hover
  expect(await style(other, 'filter')).not.toContain('brightness'); // clean paper
  expect(await style(active, 'height')).toBe('46px');
  expect(await style(active, 'marginTop')).toBe('-6px');
  expect(await style(active, 'zIndex')).toBe('2');
  expect(await style(active, 'filter')).toContain('saturate(2.2)');
  expect(await style(active, 'fontWeight')).toBe('700');
  expect(await style(active, 'fontSize')).toBe('20px');
  expect(await style(active, 'transform')).toBe('none');
  const tack = await active.evaluate((e) => { const c = getComputedStyle(e, '::before'); return [c.width, c.height, c.backgroundImage]; });
  expect(tack[0]).toBe('18px');
  expect(tack[1]).toBe('18px');
  expect(tack[2]).toContain('rivet');
  expect(await other.evaluate((e) => getComputedStyle(e, '::before').content)).toBe('none'); // only the selected note is tacked
});

test('bartender: wide notes, Update Orders is an iron plate and new orders turn it alarm red with a hidden label', async ({ page }) => {
  await login(page, 'bartender');
  expect(await style(page.locator('#paid'), 'backgroundImage')).toContain('tab-note-wide');
  expect(await style(page.locator('.menu button[aria-pressed="true"]'), 'backgroundImage')).toContain('tab-note-wide');
  const alarm = page.locator('#retrieve_orders');
  expect(await style(alarm, 'backgroundImage')).toContain('plate-worn');
  expect(await style(alarm, 'height')).toBe('36px');
  expect(await alarm.locator('.new_orders_label').evaluate((e) => getComputedStyle(e).display)).toBe('none');
  const seal = () => alarm.evaluate((e) => { const c = getComputedStyle(e, '::after'); return [c.content, c.backgroundImage, c.width, c.pointerEvents]; });
  expect((await seal())[0]).toBe('none'); // no seal while there is nothing new
  await page.evaluate(() => document.getElementById('retrieve_orders').classList.add('has-new'));
  expect(await seal()).toEqual(['""', expect.stringContaining('seal-red'), '28px', 'none']); // a red wax seal on the corner
  expect(await style(alarm, 'backgroundImage')).toBe('none');
  expect(await style(alarm, 'backgroundColor')).toBe('rgb(200, 16, 46)');
  expect((await alarm.textContent()).trim()).toBe('Update Orders (new orders)'); // read by screen readers
  await alarm.hover();
  expect(await style(alarm, 'height')).toBe('36px'); // an action, it does not lift like a tab
});

test('the paper behind every label is light enough for sepia text at 5:1', async ({ page }) => {
  await page.goto('/index.html');
  // label zones: tabs below the torn top band, slips between the nail and the torn bottom
  const files = [1, 2, 3].flatMap((i) => [[`tab-note${i}`, 0.05, 0.2, 0.95, 1], [`tab-note-wide${i}`, 0.05, 0.2, 0.95, 1]])
    .concat([1, 2].map((i) => [`slip${i}`, 0.06, 0.13, 0.94, 0.94]), [['paper-list', 0, 0, 1, 1]], [1, 2, 3, 4].map((i) => [`card-paper${i}`, 0.08, 0.1, 0.92, 0.97]));
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

test('buttons darken on hover and sink when pressed; Log Out, Undo and Redo are worn iron plates', async ({ page }) => {
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
  for (const sel of ['footer #logout', '#undo', '#redo']) {
    const plate = page.locator(sel);
    expect(await style(plate, 'backgroundImage'), sel).toContain('plate-worn');
    expect(await style(plate, 'borderTopWidth'), sel).toBe('0px');
    expect(await style(plate, 'filter'), sel).toContain('drop-shadow');
    expect(await style(plate, 'boxShadow'), sel).toBe('none');
  }
  expect(await style(page.locator('footer #logout'), 'rotate')).toBe('-0.6deg');
  expect(await style(page.locator('#redo'), 'rotate')).toBe('0.8deg');
  // tilted anchors follow the old arrows: Undo turns counter-clockwise, Redo clockwise
  expect(await style(page.locator('#undo .anchor'), 'rotate')).toBe('-32deg');
  expect(await style(page.locator('#redo .anchor'), 'rotate')).toBe('32deg');
  expect(await style(page.locator('#undo .anchor'), 'maskImage')).toContain('anchor.webp');
  await page.locator('footer #logout').focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); // keyboard focus: the two-tone ring keeps its dark half on a plate
  expect(await style(page.locator('footer #logout'), 'boxShadow')).toContain('6px');
  await page.locator('#drink_database .drink:not(.fade)').nth(1).click(); // Undo needs two steps to be live
  await page.locator('#undo').hover();
  await expect.poll(() => style(page.locator('#undo'), 'filter')).toContain('brightness(1.12)');
});

test('small plates: Add +1 is a rusty brass plate that darkens and sinks (the docket buttons are hairline frames, see the F11 test)', async ({ page }) => {
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
  expect(await style(beers, 'backgroundColor')).toBe('rgba(214, 140, 40, 0.3)'); // the selected tab's warm tint, no tack
  expect(await style(beers, 'color')).toBe('rgb(0, 0, 0)');
});

test('About and Passwords open as opaque parchment nailed at the top, with the bolt-head Close', async ({ page }) => {
  await page.goto('/index.html');
  for (const id of ['about', 'passwords']) {
    await page.click('#' + id);
    const win = page.locator(`#${id}_window`), close = win.locator('.close_window');
    await expect(win).toBeVisible();
    expect(await style(win, 'backgroundImage')).toMatch(/rivet.*rivet.*paper-list/);
    expect(await style(win, 'backgroundColor')).toBe('rgb(255, 255, 255)'); // opaque under the paper: nothing shows through
    expect(await style(win, 'color')).toBe('rgb(42, 23, 9)');
    expect(await style(close, 'backgroundImage')).toContain('bolt.webp');
    expect(await style(close, 'borderTopLeftRadius')).toBe('50%');
    expect(await style(close.locator('.icon'), 'strokeWidth')).toBe('3px');
    const b = await close.boundingBox();
    expect(b.width).toBe(48);
    expect(b.height).toBe(48);
    expect(b.y).toBeGreaterThanOrEqual((await win.boundingBox()).y + 30); // below the nails
    await close.click();
  }
  await page.click('#about');
  const link = page.locator('#about_window a');
  await link.hover();
  expect(await style(link, 'color')).toBe('rgb(42, 23, 9)');
  expect(await style(link, 'textDecorationLine')).toBe('underline');
});

test('login box: wood2 planks with iron corners, Alegreya Sans fields, and "Order your Drinks!" hides while it is open', async ({ page }) => {
  await page.goto('/index.html');
  const order = page.locator('#customer');
  await expect(order).toBeVisible();
  await order.click();
  const box = page.locator('#loginBox');
  await expect(box).toBeVisible();
  expect(await style(box, 'backgroundImage')).toContain('wood2');
  expect(await style(box, 'backgroundImage')).not.toContain('wood3');
  expect(await style(box, 'borderImageSource')).toContain('iron-frame');
  expect(await style(page.locator('#user_name_input'), 'fontFamily')).toContain('Alegreya Sans');
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
    expect(await style(info.locator('span'), 'fontFamily')).toContain('Pirata One');
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

test('order bars: rusty iron plates, rivets on the header only, and a rope seam towards the ledger', async ({ page }) => {
  for (const role of ['customer', 'management']) {
    await login(page, role);
    const bars = page.locator('.checkout, .selection_header');
    for (const bar of await bars.all()) {
      if (!(await bar.isVisible())) continue; // the phone hides the header
      const bg = await style(bar, 'backgroundImage');
      expect(bg.includes('rivet')).toBe(await bar.evaluate((e) => e.classList.contains('selection_header')));
      expect(bg).toContain('rust');
      expect(bg).toContain('iron');
  }
  expect(await style(page.locator('.checkout'), 'backgroundImage')).not.toContain('board');
  const rope = (sel, pseudo) => page.locator(sel).evaluate((e, p) => getComputedStyle(e, p).backgroundImage, pseudo);
  expect(await rope('.checkout', '::before')).toContain('rope');
  expect(await rope('.selection_header', '::after')).toContain('rope');
  }
});

test('bartender (F11): playing-card orders on a green baize, torn tabs on the rail, the open card is a docket', async ({ page }) => {
  await login(page, 'bartender');
  const list = page.locator('.order_list');
  expect(await style(list, 'backgroundImage')).toMatch(/radial-gradient.*felt-green.*wood2/s); // vignette, baize, then the rail wood
  expect(await style(list, 'borderTopWidth')).toBe('14px');
  const pseudo = (loc, which, prop) => loc.evaluate((e, [w, p]) => getComputedStyle(e, w)[p], [which, prop]);
  const open = page.locator('.pc.open').first(), paid = page.locator('.pc.paid').first();
  expect(await style(open, 'backgroundImage')).toContain('card-face');
  expect(await style(open, 'borderRadius')).toBe('12px');
  expect(await style(open.locator('.pc_idx i').first(), 'backgroundImage')).toContain('pip-heart');
  expect(await style(paid.locator('.pc_idx i').first(), 'backgroundImage')).toContain('pip-spade');
  expect(await pseudo(paid, '::after', 'backgroundImage')).toContain('tax-stamp');
  expect(await pseudo(paid, '::after', 'opacity')).toBe('0.35');
  expect(await pseudo(page.locator('.group.waiting .pile').first().locator('.pc').last(), '::before', 'backgroundImage')).toContain('pip-heart'); // the big pip, bottom card only
  expect(await pseudo(page.locator('.group.waiting .pile').first().locator('.pc').first(), '::before', 'backgroundImage')).toBe('none');
  await expect(open.locator('.o_when use')).toHaveAttribute('href', 'img/icons.svg#clock'); // a quiet clock marks the time
  expect(await style(open.locator('.o_when .icon'), 'opacity')).toBe('0.6');
  await expect(open.locator('.o_state')).toHaveText('Not paid');
  await expect(paid.locator('.o_state')).toHaveText('Paid'); // the bartender's name is on the docket stamp
  await expect(paid.locator('.stamp')).toContainText('Paid by');
  // the docket's buttons are hairline frames on the card, not plates, and the order bars' rope stays off them
  await page.locator('.pc.open .o_who').first().click({ force: true });
  const cancel = page.locator('.pc.open .cancel_order').first();
  expect(await style(cancel, 'backgroundImage')).toBe('none');
  expect(await style(cancel, 'borderTopWidth')).toBe('1px');
  expect(await style(page.locator('.pc.open .order').first(), 'marginRight')).toBe('-7px'); // the scrollbar lies in the card's margin
  expect(await pseudo(page.locator('.pc.open .checkout').first(), '::before', 'content')).toBe('none');
  await page.locator('.pc.open .o_who').first().click({ force: true }); // close it again
  await page.waitForTimeout(400);
  const bottom = page.locator('.group.waiting .pile').first().locator('.pc').last(); // the bottom card of a pile wears the big pip until it is opened
  expect(await pseudo(bottom, '::before', 'backgroundImage')).toContain('pip-heart');
  await bottom.locator('.o_who').click({ force: true });
  await page.waitForTimeout(400);
  expect(await pseudo(bottom, '::before', 'backgroundImage')).toBe('none');
  await bottom.locator('.o_who').click({ force: true });
  await page.waitForTimeout(400);
  // the state stamps are inked by hand: a ragged filter on the stamp and its frame, a tilt of their own on every card
  const tilts = await page.locator('.pc .o_state').evaluateAll((l) => l.slice(0, 4).map((e) => getComputedStyle(e).rotate));
  expect(new Set(tilts).size).toBe(4);
  expect(await style(open.locator('.o_state'), 'filter')).toContain('#ink-t1');
  expect(await pseudo(open.locator('.o_state'), '::before', 'filter')).toContain('#ink-b1');
  // the tabs lie on the rail with a torn bottom; the plate is not a note
  expect(await style(page.locator('.menu'), 'marginBottom')).toBe('-24px');
  for (const [i, id] of [[1, 'all'], [2, 'unpaid'], [3, 'paid']]) expect(await style(page.locator('#' + id), 'maskImage')).toContain('tab-bottom' + i);
  expect(await style(page.locator('#retrieve_orders'), 'maskImage')).toBe('none');
  expect(await style(page.locator('#unpaid'), 'height')).toBe('50px');
  // hover lifts the card 14 px; open cards stay put
  await open.locator('.accordion').hover(); // the band: the next card lies over the rest
  await page.waitForTimeout(600);
  expect(await style(open, 'translate')).toBe('0px -14px');
  await open.locator('.accordion').click();
  await page.waitForTimeout(600);
  expect(await style(open, 'translate')).toBe('none');
  expect(Math.round((await open.boundingBox()).width)).toBe(284);
  const docket = open.locator('.panel');
  expect(await style(docket.locator('.order'), 'maxHeight')).toBe('190px');
  await expect(docket.locator('.order_details .qty').first()).toHaveText(/^\d+×$/);
  expect(await style(docket.locator('.total'), 'boxShadow')).toBe('none'); // can't be clicked, so no plate
  await expect(docket.getByRole('button')).toHaveCount(2);                  // only Cancel and Mark as Paid
});

test('bartender (F11): reduced motion lifts nothing, an outline marks the card', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page, 'bartender');
  const card = page.locator('.pc').first();
  await card.locator('.accordion').hover();
  expect(await style(card, 'translate')).toBe('none');
  expect(await style(card, 'outlineStyle')).toBe('solid');
  expect(await style(card, 'transitionDuration')).toBe('0s');
});

test('toasts (F9): burnt note with a title and a detail, wax seal icons, two drifting mist layers behind the text', async ({ page }) => {
  await login(page, 'customer');
  const toast = page.locator('#toast'), wrap = page.locator('.toast_wrap');
  const mist = (pe) => wrap.evaluate((e, p) => { const c = getComputedStyle(e, p); return [+c.opacity, c.animationPlayState, c.animationDirection, c.pointerEvents, c.zIndex, c.backgroundImage]; }, pe);
  expect(await style(toast, 'borderImageSource')).toContain('note');
  expect(await toast.evaluate((e) => getComputedStyle(e, '::after').backgroundImage)).toContain('tack');
  expect((await mist('::before'))[0]).toBe(0);
  expect((await mist('::before'))[1]).toBe('paused'); // no drifting while closed
  await page.locator('#pay:visible, #pay_phone:visible').click(); // empty order
  await expect(toast).toHaveClass(/is-error/);
  await expect(toast.locator('.toast_title')).toHaveText('Nothing to order');
  await expect(toast.locator('.toast_detail')).toHaveText('Select your drinks before placing an order.');
  expect(await style(toast.locator('.toast_title'), 'fontSize')).toBe('20px');
  expect(await style(toast.locator('.toast_detail'), 'fontSize')).toBe('16px');
  expect(await style(toast, 'textShadow')).toBe('none');
  await expect.poll(async () => (await mist('::before'))[0]).toBeGreaterThan(0.9);
  const [m1, m2] = [await mist('::before'), await mist('::after')];
  for (const m of [m1, m2]) { expect(m[1]).toBe('running'); expect(m[3]).toBe('none'); expect(m[4]).toBe('-1'); expect(m[5]).toContain('mist'); }
  expect(m2[2]).toBe('reverse'); // the second layer drifts the other way
  expect(m2[0]).toBeLessThan(m1[0]);
  expect(await style(toast.locator('.toast_icon'), 'backgroundImage')).toContain('seal-red');
  expect(await style(toast.locator('.toast_ribbon'), 'maskImage')).toContain('stamp-wear'); // worn red ribbon
  expect(await style(toast.locator('.toast_icon'), 'width')).toBe('44px');
  await page.locator('#drink_database .drink:not(.fade)').first().click();
  await page.locator('#pay:visible, #pay_phone:visible').click();
  await expect(toast).not.toHaveClass(/is-error/);
  expect(await style(toast.locator('.toast_icon'), 'backgroundImage')).toContain('seal-green');
  expect(await style(toast.locator('.toast_ribbon'), 'display')).toBe('none');
  await expect(page.locator('#live')).toHaveText(/^Order (paid|placed)\. .+/); // the live region reads "title. detail"
});

test('toasts: reduced motion stops the mist drifting', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page, 'customer');
  await page.locator('#pay:visible, #pay_phone:visible').click();
  await expect(page.locator('#toast')).toHaveClass(/is-open/);
  expect(await page.locator('.toast_wrap').evaluate((e) => getComputedStyle(e, '::before').animationName)).toBe('none');
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
  await expect(credit).toHaveText(/^Credit SEK \d+:-$/);
  expect(await style(credit, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)'); // a label, no plate
  const h = await page.locator('.welcome h1').boundingBox(), c = await credit.boundingBox();
  expect(h.x + h.width <= c.x || h.y + h.height <= c.y).toBe(true); // never under the greeting
  if (page.viewportSize().width >= 1024 && page.viewportSize().height >= 600) { // one-screen grid: the credit lines up with the page
    const [amountRight, panelRight, creditMid, greetMid] = await page.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); return [r('.credit .amount').right, r('.selection_header').right, r('#creditDisplay').top + r('#creditDisplay').height / 2, r('.welcome h1').top + r('.welcome h1').height / 2]; });
    expect(Math.abs(amountRight - panelRight)).toBeLessThanOrEqual(1); // ends on the order panel's right edge
    expect(Math.abs(creditMid - greetMid)).toBeLessThanOrEqual(1); // centred on the greeting
  }
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
  await expect(page.locator('#your_credit')).toHaveText('Doubloons');
  await login(page, 'bartender');
  expect(await style(page.locator('#orders_q'), 'fontFamily')).toContain('Pirata One');
});

test('landing: cloth flag line on one row at any width, toast gives way to a window, pirate drop still works', async ({ page }) => {
  await page.goto('/index.html');
  const flags = page.locator('footer .languages_menu img');
  expect(await page.locator('footer .languages_menu').evaluate((e) => getComputedStyle(e, '::before').backgroundImage)).toContain('rope.webp');
  for (const n of ['eng', 'sve', 'ita', 'esp', 'pirate']) await expect(flags.and(page.locator(`[src$="flag-${n}.webp"]`))).toHaveCount(1);
  for (const width of [320, 375, 641, 800, 1000, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const tops = await flags.evaluateAll((l) => l.map((i) => i.getBoundingClientRect().y));
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(20); // one row; only the sag differs
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.getBoundingClientRect().height)).toBeGreaterThanOrEqual(800); // storm fills the screen
  }
  await page.evaluate(() => showToast('Access denied', 'Back to your own deck.', true));
  await expect(page.locator('#toast')).toHaveClass(/is-open/);
  await page.click('#about');
  await expect(page.locator('#toast')).not.toHaveClass(/is-open/);
  await page.click('#about_window .close_window');
  await page.locator('#pirateFlag').dragTo(page.locator('#piratePic'));
  await expect(page.locator('#ghostShip')).toBeVisible();
  await expect(page.locator('#piratePic')).toBeHidden();
});

test('easter egg: aged logo is a toggle button, drop or press shows the ghost ship, no hot links, 5 languages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/index.html');
  const egg = page.getByRole('button', { name: 'The Flying Dutchman: summon the ghost ship' });
  await expect(egg).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#piratePic')).toHaveAttribute('src', 'img/logo/aged.webp');
  await expect(page.locator('#ghostShip')).toBeHidden();
  expect(await page.locator('video, [src*="9cache"], [poster]').count()).toBe(0); // the 9gag video is gone
  await egg.focus();
  await page.keyboard.press('Enter');
  await expect(egg).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#ghostShip')).toBeVisible();
  await expect(page.locator('#piratePic')).toBeHidden();
  await page.locator('#pirateFlag').dragTo(egg);
  await expect(egg).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#piratePic')).toBeVisible();
  await page.click('#sve');
  await expect(page.locator('#summon_label')).toHaveText('Flygande Holländaren: kalla fram spökskeppet');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('demo logins: grouped with role icons, Use fills the form, fits 1280x720, 44px on phones, 5 languages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/index.html');
  await page.click('#passwords');
  const list = page.locator('#passwords_window .scrollable');
  expect(await list.evaluate((e) => e.scrollHeight <= e.clientHeight + 1)).toBe(true); // no scrolling
  await expect(page.locator('.account_group h3 svg use')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Use hassan' })).toBeVisible(); // each Use is named after its account
  const use = page.locator('.use[data-user="yawen"]');
  expect(await style(use, 'backgroundImage')).toBe('none'); // secondary: an outline, no plate
  await use.click();
  await expect(page.locator('#passwords_window')).toBeHidden();
  await expect(page.locator('#user_name_input')).toHaveValue('yawen');
  await expect(page.locator('#password_input')).toHaveValue('yawen123');
  await expect(page.locator('#login')).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL('**/bartender.html');
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.setItem('index', 1));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await page.click('#passwords');
  await expect(page.locator('.use[data-user="hassan"] .use_label')).toHaveText('Använd');
  await expect(page.locator('#group_test')).toHaveText('Testanvändare, alla sidor');
  for (const b of await page.locator('.use').evaluateAll((l) => l.map((e) => [e.offsetWidth, e.offsetHeight]))) expect(Math.min(...b)).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('drink cards (F8): four torn papers, warm lift on hover and focus, worn stock stamps, kelp list with a rim', async ({ page }) => {
  await login(page, 'customer');
  const cards = page.locator('#drink_database .drink');
  for (let i = 0; i < 4; i++) expect(await style(cards.nth(i), 'backgroundImage')).toContain(`card-paper${i + 1}`);
  expect(await style(cards.nth(4), 'backgroundImage')).toContain('card-paper1'); // 4n+1 again
  expect(await style(cards.first(), 'color')).toBe('rgb(42, 23, 9)'); // sepia
  expect(await style(cards.first(), 'filter')).toContain('drop-shadow');
  expect(await style(cards.first(), 'filter')).not.toContain('saturate');
  await cards.nth(1).hover();
  await expect.poll(() => style(cards.nth(1), 'filter')).toContain('saturate(1.4)'); // the paper warms
  expect(await style(cards.nth(1), 'transform')).not.toBe('none'); // lift and tilt
  await page.mouse.move(0, 0);
  await cards.nth(2).focus();
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab'); // keyboard focus, so :focus-visible applies
  await expect.poll(() => style(cards.nth(2), 'filter')).toContain('saturate(1.4)');
  expect(await style(cards.nth(2), 'outlineStyle')).toBe('solid'); // the focus ring stays
  const list = page.locator('.drink_list');
  const bg = await style(list, 'backgroundImage');
  expect(bg).toContain('board-rust'); // one 1024 px tile of random specks; the old 94, 150 and 200 px tiles showed bands and columns
  for (const t of ['tarnish', 'board-kelp']) expect(bg).not.toContain(t);
  expect(await style(list, 'boxShadow')).toContain('inset');
  const low = page.locator('.drink .low_stock').first();
  expect(await style(low, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)'); // no fill: ink on paper
  expect(await style(low, 'color')).toBe('rgb(106, 18, 30)');
  expect(await low.evaluate((e) => getComputedStyle(e, '::before').borderTopStyle)).toBe('double'); // the frame is ::before, so dry-ink gaps miss the letters
  expect(await style(low, 'textTransform')).toBe('uppercase');
  expect(parseFloat(await style(low, 'rotate'))).toBeGreaterThanOrEqual(-9); // -7 deg, jittered 2 deg per card
  expect(parseFloat(await style(low, 'rotate'))).toBeLessThanOrEqual(-5);
  expect(await style(low, 'maskImage')).toContain('stamp-wear');
  expect(await style(low, 'filter')).toContain('ink-t'); // ragged letters
  expect(await low.evaluate((e) => getComputedStyle(e, '::before').filter)).toContain('ink-b'); // ragged frame with dry gaps
  const tilts = await page.locator('.drink .low_stock').evaluateAll((l) => l.slice(0, 4).map((e) => getComputedStyle(e).rotate));
  expect(new Set(tilts).size).toBeGreaterThan(1); // no two neighbours alike
  const out = page.locator('.drink .out_stock').first();
  expect(await style(out, 'color')).toBe('rgb(28, 20, 16)');
  expect(await style(out, 'fontSize')).toBe('20px');
  expect(await style(out, 'position')).toBe('absolute');
  expect(parseFloat(await style(out, 'rotate'))).toBeLessThanOrEqual(-18); // -20 deg, jittered 2 deg per card
  expect(parseFloat(await style(out, 'rotate'))).toBeGreaterThanOrEqual(-22);
  const [c, s] = await out.evaluate((e) => [e.closest('.drink').getBoundingClientRect(), e.getBoundingClientRect()].map((r) => [r.left + r.width / 2, r.top + r.height / 2]));
  expect(Math.abs(c[0] - s[0])).toBeLessThan(2); // across the middle of the card
  await expect(out).toHaveText('Out of stock'); // real text for screen readers
});

test('About (F10): one sheet, three ruled columns, three textured icons, no inner scroll, 5 languages, safe repo link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/index.html');
  await page.click('#about');
  const win = page.locator('#about_window');
  await expect(win).toBeVisible();
  expect(await win.evaluate((e) => e.scrollHeight <= e.clientHeight)).toBe(true); // no scrolling
  expect((await win.boundingBox()).width).toBe(920);
  await expect(page.locator('.about_cols section')).toHaveCount(3);
  expect(await style(page.locator('.about_cols'), 'gridTemplateColumns').then((v) => v.split(' ').length)).toBe(3);
  for (const k of ['anchor', 'wheel', 'skull']) expect(await page.locator('.about_cols h3').evaluateAll((a, k) => a.some((h) => getComputedStyle(h, '::before').backgroundImage.includes(`about-${k}`)), k)).toBe(true);
  expect(await page.locator('.about_cols li').first().evaluate((e) => getComputedStyle(e, '::before').content)).toBe('"–"'); // plain dash bullets
  expect(await page.locator('#about_window .scrollable').count()).toBe(0);
  const link = win.locator('a');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(page.locator('#about_try li')).toHaveText(['Open Get the passwords and pick a role.', 'Order as a customer, serve as a bartender, restock as a manager.', 'Every action can be undone.', 'Change language with the flags.', 'Drop the pirate flag on the ship.']);
  await page.evaluate(() => { localStorage.setItem('index', 1); });
  await page.reload();
  await page.click('#about');
  await expect(page.locator('#about_try_title')).toHaveText('Testa');
  await expect(page.locator('#about_built li').nth(1)).toHaveText('Ångra och gör om');
  await expect(page.locator('.about_cols section').nth(2).locator('li')).toHaveCount(5); // the crew names stay as they are
  await page.setViewportSize({ width: 375, height: 700 });
  expect(await style(page.locator('.about_cols'), 'gridTemplateColumns').then((v) => v.split(' ').length)).toBe(1); // one column on phones
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
