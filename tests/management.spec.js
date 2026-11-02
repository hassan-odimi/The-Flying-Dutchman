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
  test.setTimeout(150000); // two axe runs over the whole drink list take 27 s in Firefox alone, more when the suite runs in parallel
  await axe(page);
  await tabTo(page, /Add \+1/);
  await page.keyboard.press('Enter');
  await axe(page);
});

test('order rows and total use whole kronor, same as the drink list', async ({ page }) => {
  const id = await page.evaluate(() => DB_SYSTEMBOLAGET.find((d) => d.prisinklmoms === '14.90').artikelid);
  await page.click('#a1_' + id);
  await page.click('#a10_' + id);
  await expect(page.locator('#drink_selection .order .price')).toHaveText('SEK 154:-'); // 11 x 14
  await expect(page.locator('#total')).toHaveText('Total: SEK 154:-');
});

// A drink the bar stocked before and has sold out of gets a round NOT STOCKED seal instead of "In Stock: 0"; a drink never carried gets its dashed pair, the Catalogue only slot
test('a sold-out drink carries the NOT STOCKED seal and a never-carried one the Catalogue only slot, in every language', async ({ page }) => {
  const sold = page.locator('.drink', { has: page.locator('#dn593104') }); // Chang Beer: in the stock list at 0
  const never = page.locator('.drink', { has: page.locator('#dn25053') }); // Braastad XO: never stocked
  await expect(sold.locator('.seal')).toHaveCount(1);
  await expect(sold.locator('.inStock')).toHaveCount(0);
  await expect(sold.locator('.seal .not_stocked')).toHaveText('Not stocked');
  expect(await sold.locator('.seal svg').getAttribute('aria-hidden')).toBe('true'); // the rim text is not read
  expect(await sold.locator('.seal').evaluate((e) => getComputedStyle(e).filter)).toContain('#rough');
  expect(await sold.locator('.seal i').evaluate((e) => getComputedStyle(e).webkitMaskImage || getComputedStyle(e).maskImage)).toContain('anchor');
  await expect(never.locator('.seal')).toHaveCount(0);
  await expect(never.locator('.inStock')).toHaveCount(0);
  await expect(never.locator('.slot .catalogue_only')).toHaveText('Catalogue only');
  expect(await never.locator('.slot circle').evaluate((e) => getComputedStyle(e).strokeDasharray)).not.toBe('none'); // dashed, the seal's unprinted pair
  await expect(page.locator('.drink', { has: page.locator('#dn733051') }).locator('.inStock')).toHaveText('In Stock:'); // stocked drinks keep their count
  await page.evaluate(() => translate(1));
  await expect(sold.locator('.seal .not_stocked')).toHaveText('Ej i lager');
  await expect(sold.locator('.seal_txt')).toHaveText('EJ I LAGER · EJ I LAGER ·');
  await expect(never.locator('.catalogue_only')).toHaveText('Endast katalog');
});

// F12: torn paper rows, and the shared paper ledger
test('rows are torn paper in four variants, the stock count is 40 px, Add buttons share a row', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('#drink_database')).not.toHaveClass(/intro/, { timeout: 10000 }); // V12b G3: the first-load intro has ended
  const bgs = await page.locator('.drink').evaluateAll((a) => a.slice(0, 5).map((e) => getComputedStyle(e).backgroundImage.match(/row-paper(\d)/)[1]));
  expect(bgs).toEqual(['1', '2', '3', '4', '1']);
  const row = page.locator('.drink').first();
  expect(await row.evaluate((e) => getComputedStyle(e).filter)).toContain('drop-shadow');
  expect(await row.evaluate((e) => getComputedStyle(e).color)).toBe('rgb(42, 23, 9)');
  expect(await page.locator('.drink:has(.c3 h2) .c3 h2').first().evaluate((e) => getComputedStyle(e).fontSize)).toBe('40px'); // the first rows are never-stocked slots, so take a row with a count
  expect(await row.evaluate((e) => getComputedStyle(e.querySelector('.c2')).columnCount)).toBe('2');
  const ys = await row.locator('.add_button').evaluateAll((a) => a.map((b) => Math.round(b.getBoundingClientRect().y)));
  expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(4); // all three on one line (the row's 0.3 deg tilt moves them a pixel)
  await page.setViewportSize({ width: 375, height: 800 });
  expect(await page.locator('.drink').first().evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('card-paper1'); // portrait paper on phones
});

test('Your Order is the paper ledger: quantity, bottle, name, price and a brush-cross remove', async ({ page }) => {
  const id = await page.evaluate(() => DB_SYSTEMBOLAGET[0].artikelid);
  await page.click('#a1_' + id);
  await page.click('#a10_' + id);
  const row = page.locator('#drink_selection .order');
  await expect(row).toHaveCount(1);
  await expect(row.locator('.qty')).toHaveText('11\u00d7'); // 1 + 10, one row
  expect(await row.locator('.qty').evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Pirata');
  expect(await page.locator('#drink_selection').evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('paper-list');
  await expect(row.locator('.quantity')).toHaveCount(0); // the red "( x 11)" is gone
  await expect(row.locator('.delete use')).toHaveAttribute('href', /cross-brush/);
  await row.locator('.delete').click();
  await expect(row).toHaveCount(0);
});

// F13: the receipt slip after Place Stock Order
test('placing an order leaves a numbered receipt with a worn ORDERED stamp, read out once', async ({ page }) => {
  const id = await page.evaluate(() => DB_SYSTEMBOLAGET.find((d) => d.prisinklmoms === '14.90').artikelid);
  await page.click('#a1_' + id);
  await page.click('#a10_' + id);
  await heard(page);
  await page.click('#pay');
  const slip = page.locator('.receipt_slip');
  await expect(slip.locator('.receipt_head')).toHaveText('Stock order #0001');
  await expect(slip.locator('.receipt_time')).not.toBeEmpty();
  await expect(slip.locator('.receipt_lines li')).toHaveCount(1);
  await expect(slip.locator('.receipt_lines li b')).toHaveText('11×');
  await expect(slip.locator('.receipt_sum')).toContainText('SEK 154:-');
  await expect(slip.locator('.receipt_stamp')).toHaveText('Ordered');
  await expect(slip.locator('.receipt_note')).toHaveText('Delivery is booked with each supplier.');
  const stamp = await slip.locator('.receipt_stamp').evaluate((e) => { const s = getComputedStyle(e); return [s.rotate, s.maskImage, s.color, s.filter]; });
  expect(stamp[0]).toBe('-12deg');
  expect(stamp[1]).toContain('stamp-wear'); // worn
  expect(stamp[2]).toBe('rgb(15, 61, 24)'); // --stamp-green
  expect(stamp[3]).toContain('rough'); // ragged edge
  expect(await slip.locator('.receipt_stamp').evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe('double');
  await expect(page.locator('#total')).toHaveText('Total: SEK 0:-');
  await page.waitForTimeout(300);
  const said = await heard(page);
  expect(count(said, /^polite: /)).toBe(1);
  expect(said.join(" ")).toMatch(/Order placed\. Stock order 0001, total SEK 154\./);
  await axe(page);
});

test('the receipt clears on the first new Add, or on Start a new order which returns focus to the list', async ({ page }) => {
  const add = page.locator('.add_button').first();
  await add.click();
  await page.click('#pay');
  await expect(page.locator('.receipt')).toHaveCount(1);
  await add.click();
  await expect(page.locator('.receipt')).toHaveCount(0);
  await expect(page.locator('#drink_selection .order')).toHaveCount(1);
  await page.click('#pay');
  await expect(page.locator('.receipt_head')).toHaveText('Stock order #0002'); // the number runs on
  await page.click('.receipt_new');
  await expect(page.locator('.receipt')).toHaveCount(0);
  await expect(page.locator('#drink_database .add_button').first()).toBeFocused();
});

test('the receipt follows the language', async ({ page }) => {
  await page.locator('.add_button').first().click();
  await page.click('#pay');
  await page.click('#sve');
  await expect(page.locator('.receipt_title')).toHaveText('Lagerorder');
  await expect(page.locator('.receipt_stamp')).toHaveText('Beställd');
  await expect(page.locator('.receipt_new')).toHaveText('Starta en ny order');
});

test('Your Order and Total follow the language, and the receipt number survives a log out', async ({ page }) => {
  await page.locator('.add_button').first().click();
  await expect(page.locator('#total')).toHaveText(/^Total: SEK \d+:-$/);
  await page.click('#sve');
  await expect(page.locator('#your_order')).toHaveText('Din beställning');
  await expect(page.locator('#total')).toHaveText(/^Totalt: SEK \d+:-$/);
  await page.click('#pay');
  await expect(page.locator('.receipt_head')).toHaveText('Lagerorder #0001');
  await page.click('#logout');
  await login(page, 'management');
  await page.locator('.add_button').first().click();
  await page.click('#pay');
  await expect(page.locator('.receipt_head')).toHaveText('Stock order #0002');
});
