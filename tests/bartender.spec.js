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
  expect(await tabTo(page, /^button, Order \d+, /)).toMatch(/, not expanded$/);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/, expanded$/);
});

test('buttons inside a collapsed order are not reachable', async ({ page }) => {
  await tabTo(page, /^button, Order \d+, /);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/^button, Order \d+, /);
});

test('order rows read without separator noise', async ({ page }) => {
  expect(await tabTo(page, /^button, Order \d+, /)).not.toMatch(/\||:::/);
});

test('mark as paid is confirmed once', async ({ page }) => {
  await tabTo(page, /^button, Order 20, /);
  await page.keyboard.press('Enter');
  await tabTo(page, /Mark as Paid/, 5);
  await heard(page);
  await page.keyboard.press('Enter');
  let n = 0; // the live region can be late under load: wait for the first, then give a second one time to show up
  await expect.poll(async () => (n += count(await heard(page), /^polite: /))).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  expect(n + count(await heard(page), /^polite: /)).toBe(1);
});

test('cancel order is confirmed once', async ({ page }) => {
  await tabTo(page, /^button, Order 20, /);
  await page.keyboard.press('Enter');
  await tabTo(page, /Cancel Order/, 5);
  await heard(page);
  await page.keyboard.press('Enter');
  let n = 0; // the live region can be late under load: wait for the first, then give a second one time to show up
  await expect.poll(async () => (n += count(await heard(page), /^polite: /))).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  expect(n + count(await heard(page), /^polite: /)).toBe(1);
});

test('axe: no WCAG 2.2 AA violations', async ({ page }) => {
  await axe(page);
});

test('Update Orders is idle on load, then shows a new order when clicked', async ({ page }) => {
  await expect(page.locator('#retrieve_orders')).not.toHaveClass(/has-new/);
  const before = await page.locator('.accordion').count();
  await page.evaluate(() => { // what customer.js does when an order is placed
    const orders = JSON.parse(localStorage.getItem('SESSION')) || SESSIONS_TRANSACTIONS;
    orders.push({ ...orders[0], transaction_id: 'T99999', paid: false });
    localStorage.setItem('SESSION', JSON.stringify(orders));
    localStorage.setItem('NEWORDER', 1);
  });
  await expect(page.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
  await page.click('#retrieve_orders');
  await expect(page.locator('#retrieve_orders')).not.toHaveClass(/has-new/);
  await expect(page.locator('.accordion')).toHaveCount(before + 1);
});

test('fresh load: Update Orders is not lit', async ({ page }) => {
  await page.waitForTimeout(2500); // one poll tick
  await expect(page.locator('#retrieve_orders')).not.toHaveClass(/has-new/);
});

test('paid stamp says "with credit" when no bartender took the payment', async ({ page }) => {
  await page.evaluate(() => { SESSIONS_TRANSACTIONS.push({ ...SESSIONS_TRANSACTIONS[0], transaction_id: 'T99998', paid: true, bartender_id: 'VIP Self-Service' }); rePrintTab(); });
  await expect(page.locator('#T99998 .o_state')).toHaveText('Paid'); // the card face only says Paid
  await expect(page.locator('.pc:has(#T99998) .stamp')).toHaveText('Paid with credit');
  await expect(page.locator('.stamp', { hasText: 'Paid by' }).first()).toBeAttached(); // named bartenders still print "by" on the docket
});

test('a card reads number, customer, time, total, state, and the total says kronor (F11)', async ({ page }) => {
  expect(await tabTo(page, /^button, Order 20, /)).toMatch(/^button, Order 20, Zuleika Gorecki, 23:48, Total 50 kronor, Not paid, not expanded$/);
  await page.evaluate(() => localStorage.setItem('index', 1)); // texts are built with the language chosen
  await page.click('#sve'); // Swedish
  await page.focus('.accordion'); // first card
  expect(await page.evaluate(() => document.querySelector('.accordion').textContent)).toMatch(/Beställning 20, Zuleika Gorecki, 23:48, Totalt 50 kronor, Obetald/);
  await expect(page.locator('.group h2').first()).toHaveText('Väntar');
});

test('orders lie in piles: waiting piles of five newest first, one paid pile of six; tabs filter (F11)', async ({ page }) => {
  const n = await page.evaluate(() => ({ open: SESSIONS_TRANSACTIONS.filter((o) => !o.paid).length, paid: SESSIONS_TRANSACTIONS.filter((o) => o.paid).length }));
  const sizes = (sel) => page.locator(sel + ' .pile').evaluateAll((p) => p.map((e) => e.querySelectorAll('.pc').length));
  const waiting = await sizes('.group.waiting');
  expect(waiting.reduce((a, b) => a + b, 0)).toBe(n.open);
  expect(waiting.slice(0, -1).every((c) => c === 5)).toBe(true);
  expect(await sizes('.group.paid')).toEqual([Math.min(6, n.paid)]);
  await expect(page.locator('.group.waiting .pc').first().locator('.pc_idx b').first()).toHaveText('20'); // newest on top
  await page.click('#unpaid');
  await expect(page.locator('.group.paid')).toHaveCount(0);
  await page.click('#paid');
  await expect(page.locator('.group.waiting')).toHaveCount(0);
  const paidPiles = await sizes('.group.paid');
  expect(paidPiles.reduce((a, b) => a + b, 0)).toBe(n.paid);
  expect(paidPiles.slice(0, -1).every((c) => c === 5)).toBe(true);
  expect(await page.locator('.pc').evaluateAll((l) => l.some((e) => /SEK/.test(e.textContent)))).toBe(false); // the :- already says kronor
});

test('a card opens in place: its pile and the other piles do not move, one open card per pile, Esc closes it (F11)', async ({ page }) => {
  const rects = () => page.locator('.pile').evaluateAll((l) => l.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.height)]; }));
  const before = await rects();
  const cards = page.locator('.group.waiting .pile').first().locator('.accordion');
  await cards.nth(1).click();
  await page.waitForTimeout(400);
  expect(await rects()).toEqual(before);
  await expect(cards.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(async () => (await cards.nth(1).locator('xpath=..').boundingBox()).width).toBeGreaterThan(280); // grown to 284 px
  await cards.nth(0).click(); // the open card covers the ones below it, so pick the card above
  await expect(cards.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(cards.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await page.locator('.pc:has(> .accordion.active) .order').focus();
  await page.keyboard.press('Escape');
  await expect(cards.nth(0)).toHaveAttribute('aria-expanded', 'false');
  await expect(cards.nth(0)).toBeFocused();
});

// One open card on the whole table; a click on empty table puts it down
test('only one card is open on the table, and a click on empty table closes it', async ({ page }) => {
  const a = page.locator('.pile').nth(0).locator('.accordion').first(), b = page.locator('.pile').nth(1).locator('.accordion').first();
  await a.click();
  await expect(a).toHaveAttribute('aria-expanded', 'true');
  await b.click();
  await expect(a).toHaveAttribute('aria-expanded', 'false'); // another pile's card closes it
  await expect(b).toHaveAttribute('aria-expanded', 'true');
  await page.locator('.pc:has(> .accordion.active) .order').click(); // inside the open card: stays open
  await expect(b).toHaveAttribute('aria-expanded', 'true');
  const w = (await page.locator('#all_orders').boundingBox()).width;
  await page.locator('#all_orders').click({ position: { x: w - 80, y: 120 } }); // the empty baize
  await expect(b).toHaveAttribute('aria-expanded', 'false');
});

// Fitts: the top card of each pile opens from its whole face (on the big pip), the cards under it only from their band
test('the top card of a pile opens from anywhere on its face', async ({ page }) => {
  const pile = page.locator('.group.waiting .pile').first();
  const top = pile.locator('.pc').last(), btn = top.locator('.accordion');
  await top.scrollIntoViewIfNeeded(); // mouse.click does not scroll
  const b = await top.boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height * 0.65); // on the pip, 250 px below the band
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(await btn.evaluate((e) => getComputedStyle(e, '::after').height)).toBe('auto'); // closed-only: the open card drops the extension
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  expect(await btn.evaluate((e) => getComputedStyle(e, '::after').height)).toBe('258px');
  await expect(pile.locator('.pc').first().locator('.accordion')).toHaveAttribute('aria-expanded', 'false');
});

test('marking an order paid moves it to the paid pile and cancelling closes the pile up (F11)', async ({ page }) => {
  const count = () => page.locator('.group.waiting .pc').count();
  const n = await count();
  await page.locator('.accordion#T00020').click();
  await page.locator('.pay#T00020').click();
  expect(await count()).toBe(n - 1);
  await expect(page.locator('#all')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.group.paid .pc').first().locator('.pc_idx b').first()).toHaveText('20');
  await page.locator('.accordion#T00018').click();
  await page.locator('.delete#T00018').click();
  expect(await count()).toBe(n - 2);
  await expect(page.locator('.accordion#T00018')).toHaveCount(0);
});

test('tab labels and the Update Orders plate follow the language', async ({ page }) => {
  await page.click('#sve');
  await expect(page.locator('#all')).toHaveText('Alla beställningar');
  await expect(page.locator('#unpaid')).toHaveText('Obetalda beställningar');
  await expect(page.locator('#paid')).toHaveText('Betalda beställningar');
  await expect(page.locator('#retrieve_orders .update_label')).toHaveText('Uppdatera beställningar');
});
