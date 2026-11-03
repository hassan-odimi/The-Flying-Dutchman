// V12 micro-motion tests (docs/motion-sound-plan.md)
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { login, startSR, heard, count, axe, readAll, tabTo } = require('./helpers');

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

test('S1: login field runs on the motion tokens', async ({ page }) => {
  await page.goto('/index.html');
  await page.focus('#bartender');
  await page.keyboard.press('Enter');
  const s = await page.$eval('#user_name_input', (e) => { const c = getComputedStyle(e); return [c.transitionDuration, c.transitionTimingFunction]; });
  expect(s).toEqual(['0.15s', EASE]);
});

test('S1: bartender docket opens and closes in 250 ms', async ({ page }) => {
  await login(page, 'bartender');
  const card = page.locator('.pc').first();
  const dur = (sel) => card.locator(sel).evaluate((e) => getComputedStyle(e).transitionDuration);
  await card.locator('.accordion').click();
  expect(await dur('.panel')).toMatch(/^0\.25s/);
  expect(await card.evaluate((e) => getComputedStyle(e).transitionDuration)).not.toContain('0.15s');
  await card.locator('.accordion').click();
  expect(await dur('.panel')).toMatch(/^0\.25s/);
});

test('S1: no literal durations in transitions or animations', () => {
  const bad = [];
  for (const f of fs.readdirSync('css').filter((f) => f.endsWith('.css'))) {
    let root = false;
    fs.readFileSync('css/' + f, 'utf8').split('\n').forEach((line, i) => {
      if (/^:root\s*\{/.test(line)) root = true;
      if (root) { if (/^\}/.test(line)) root = false; return; }
      if (!/transition|animation/.test(line)) return;
      const lits = (line.replace(/var\([^)]*\)/g, '').match(/\b[1-9]\d*(\.\d+)?m?s\b/g) || []).filter((l) => l !== '40s' && l !== '55s');
      if (lits.length) bad.push(f + ':' + (i + 1) + ' ' + line.trim());
    });
  }
  expect(bad).toEqual([]);
});

const inject = (page, id) => page.evaluate((id) => { // what customer.js does when an order is placed
  const orders = JSON.parse(localStorage.getItem('SESSION')) || SESSIONS_TRANSACTIONS;
  orders.push({ ...orders[0], transaction_id: id, paid: false });
  localStorage.setItem('SESSION', JSON.stringify(orders));
  localStorage.setItem('NEWORDER', 1);
}, id);

test('S2: a new order is announced once per batch', async ({ page }) => {
  await login(page, 'bartender');
  await startSR(page);
  await inject(page, 'T99998');
  await expect(page.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
  expect(count(await heard(page), /\(new orders\)/)).toBe(1);
  await inject(page, 'T99999'); // second order before Update Orders is pressed
  await page.waitForTimeout(2500); // one poll
  expect(count(await heard(page), /\(new orders\)/)).toBe(0);
});

test('S3: the mist drifts 5 s from each toast, then hangs still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, 'customer');
  const mist = () => page.evaluate(() => $('.toast_wrap')[0].getAnimations({ subtree: true })
    .filter((a) => a.animationName === 'mist-drift').map((a) => [a.playState, a.currentTime, a.effect.getComputedTiming().activeDuration]));
  const toast = async () => { // the state is read in the same call, so a slow machine cannot let the mist move on first
    await page.evaluate(() => showToast('Order paid', 'Paid from your credit. Pick up your drinks in the VIP fridge.'));
    return mist();
  };
  await toast();
  await expect.poll(async () => (await mist()).map((m) => m[0]), { timeout: 15000 }).toEqual(['finished', 'finished']);
  (await mist()).forEach((m) => expect(Math.round(m[2] / 1000)).toBe(5)); // 5 s of drift
  const again = await toast();
  expect(again.map((m) => m[0])).toEqual(['running', 'running']);
  again.forEach((m) => expect(m[1]).toBeLessThan(2000));
});

test('S3: reduced motion has no mist animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page, 'customer');
  await page.evaluate(() => showToast('Order paid', 'x'));
  expect(await page.evaluate(() => $('.toast_wrap')[0].getAnimations({ subtree: true }).filter((a) => a.animationName === 'mist-drift').length)).toBe(0);
});

const SETTLE = 'cubic-bezier(0.34, 1.36, 0.64, 1)';
const anims = (page, sel) => page.$eval(sel, (e) => { // the computed animation, not getAnimations(): a slow machine can let a 350 ms animation end before it is read
  const c = getComputedStyle(e);
  return c.animationName === 'none' ? [] : [{ name: c.animationName, dur: parseFloat(c.animationDuration) * 1000, delay: parseFloat(c.animationDelay) * 1000, ease: c.animationTimingFunction }];
});
async function placeStockOrder(page) {
  await login(page, 'management');
  await page.locator('.add_button').first().click();
  await page.click('#pay');
  await expect(page.locator('.receipt_stamp')).toBeVisible();
}

test('S4: the receipt slip is laid down, then the ORDERED stamp is pressed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await placeStockOrder(page);
  expect(await anims(page, '.receipt')).toEqual([{ name: 'slip-lay', dur: 350, delay: 0, ease: SETTLE }]);
  expect(await anims(page, '.receipt_stamp')).toEqual([{ name: 'stamp-press', dur: 250, delay: 350, ease: SETTLE }]);
  await page.evaluate(() => setLanguage(1)); // a language switch only changes words
  expect(await page.$$eval('.receipt, .receipt_stamp', (els) => els.flatMap((e) => e.getAnimations()).filter((a) => a.playState === 'running' && a.currentTime < 100).length)).toBe(0);
});

test('S4: reduced motion shows the receipt and stamp at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await placeStockOrder(page);
  for (const sel of ['.receipt', '.receipt_stamp']) {
    expect(await anims(page, sel)).toEqual([]);
    expect(await page.$eval(sel, (e) => getComputedStyle(e).opacity)).toBe('1');
  }
});

// S5: the card table. vtCalls counts startViewTransition calls; it stays undefined where the browser lacks the API
const spyViewTransitions = (page) => page.addInitScript(() => {
  if (!document.startViewTransition) return;
  const start = document.startViewTransition.bind(document);
  window.vtCalls = 0;
  document.startViewTransition = (cb) => { window.vtCalls++; return start(cb); };
});
async function vtCalls(page, n) { // the call count, checked only where the API exists
  const calls = await page.evaluate(() => window.vtCalls);
  if (calls !== undefined) expect(calls).toBe(n);
}
const paidPile = (page, id) => page.locator('.group.paid .accordion[id="' + id + '"]');

test('S5: Mark as Paid glides the card to the Paid pile, then the stamp lands', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await spyViewTransitions(page);
  await login(page, 'bartender');
  await page.locator('.accordion#T00020').click();
  await page.locator('.pay#T00020').click();
  await expect(page.locator('.pc.stamped')).toHaveCount(1);
  await vtCalls(page, 1);
  await expect(paidPile(page, 'T00020')).toHaveCount(1);
  expect(await anims(page, '.pc.stamped .o_state')).toEqual([{ name: 'stamp-press', dur: 250, delay: 250, ease: SETTLE }]);
});

test('S5: switching tab or language moves nothing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await spyViewTransitions(page);
  await login(page, 'bartender');
  await page.click('#unpaid');
  await page.click('#all');
  await page.click('#sve');
  await expect(page.locator('#all')).toHaveText('Alla beställningar');
  await vtCalls(page, 0);
});

test('S5: Cancel, Undo and Redo glide too', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await spyViewTransitions(page);
  await login(page, 'bartender');
  await page.locator('.accordion#T00018').click();
  await page.locator('.delete#T00018').click();
  await expect(page.locator('.accordion#T00018')).toHaveCount(0);
  await page.click('#undo');
  await expect(page.locator('.accordion#T00018')).toHaveCount(1);
  await page.click('#redo');
  await expect(page.locator('.accordion#T00018')).toHaveCount(0);
  await vtCalls(page, 3);
  await expect(page.locator('.pc.dealt')).toHaveCount(0); // a card brought back is not dealt again
});

test('S5: Update Orders deals the new card, and only that card', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await spyViewTransitions(page);
  await login(page, 'bartender');
  await expect(page.locator('.pc.dealt')).toHaveCount(0); // the first table is not dealt
  await inject(page, 'T99999');
  await expect(page.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
  await page.click('#retrieve_orders');
  await expect(page.locator('.pc.dealt')).toHaveCount(1);
  await vtCalls(page, 1);
  await expect(page.locator('.pc.dealt .accordion')).toHaveAttribute('id', 'T99999');
  expect(await anims(page, '.pc.dealt')).toEqual([{ name: 'deal', dur: 400, delay: 0, ease: SETTLE }]);
  await page.reload();
  await expect(page.locator('.pc').first()).toBeVisible();
  await expect(page.locator('.pc.dealt')).toHaveCount(0);
});

test('S5: reduced motion changes the table at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await spyViewTransitions(page);
  await login(page, 'bartender');
  await page.locator('.accordion#T00020').click();
  await page.locator('.pay#T00020').click();
  await expect(paidPile(page, 'T00020')).toHaveCount(1);
  await vtCalls(page, 0);
  expect(await page.$$eval('.pc', (els) => els.flatMap((e) => e.getAnimations({ subtree: true })).length)).toBe(0);
  await inject(page, 'T99999');
  await expect(page.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
  await page.click('#retrieve_orders');
  await expect(page.locator('.accordion#T99999')).toHaveCount(1);
  expect(await page.$$eval('.pc', (els) => els.flatMap((e) => e.getAnimations({ subtree: true })).length)).toBe(0);
});

const LAY = { name: 'row-lay', dur: 250, delay: 0, ease: EASE };
const running = (page, sel) => page.$$eval(sel, (els) => els.flatMap((e) => e.getAnimations()).filter((a) => a.playState === 'running').length);

for (const role of ['customer', 'management']) {
  test(`S6: a new ${role} ledger line is laid down; a repeat add and undo move nothing`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await login(page, role);
    const add = role == 'customer' ? page.locator('.drink').first() : page.locator('#add1').first();
    await add.click();
    await expect(page.locator('#drink_selection .order')).toHaveCount(1);
    expect(await anims(page, '#drink_selection .order')).toEqual([LAY]);
    await page.waitForTimeout(400);
    await add.click(); // same drink: only the tally changes
    await expect(page.locator('#drink_selection .order')).toHaveCount(1);
    expect(await running(page, '#drink_selection .order')).toBe(0); // the class stays on the row, but the animation does not replay
    await page.click('#undo'); // undo rebuilds the ledger
    expect(await page.locator('#drink_selection .order.laid').count()).toBe(0);
    expect(await running(page, '#drink_selection .order')).toBe(0);
  });
}

test('G1: a hovered flag swings in the wind, its neighbour follows, all rest by 3.5 s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, 'customer');
  await page.hover('#sve');
  await page.waitForTimeout(300);
  const rot = (id) => page.$eval(`#${id} .languages`, (e) => parseFloat(/rotate\(([-\d.]+)deg/.exec(e.style.transform)?.[1] || 0));
  expect(Math.abs(await rot('sve'))).toBeGreaterThan(0.3);
  expect(Math.abs(await rot('eng')) + Math.abs(await rot('ita'))).toBeGreaterThan(0.05); // a neighbour follows
  await page.mouse.move(640, 300); // pointer leaves
  await page.waitForTimeout(3500);
  expect(Math.abs(await rot('sve'))).toBeLessThan(0.1);
  expect(Math.abs(await rot('eng'))).toBeLessThan(0.1);
  expect(Math.abs(await rot('ita'))).toBeLessThan(0.1);
  await page.click('#sve'); // a press adds no swing animation any more
  expect(await anims(page, '#sve .languages')).toEqual([]);
});

test('G1: a flag left under the pointer swings, then the breeze dies away and the loop stops by 8 s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, 'customer');
  const rot = () => page.$eval('#sve .languages', (e) => parseFloat(/rotate\(([-\d.]+)deg/.exec(e.style.transform)?.[1] || 0));
  await page.hover('#sve');
  await page.waitForTimeout(1500);
  expect(Math.abs(await rot())).toBeGreaterThan(0.3); // still swinging at 1.5 s
  await page.waitForTimeout(6500); // pointer has not moved: the breeze ends at 5.5 s, the spring settles within 2 s
  expect(Math.abs(await rot())).toBeLessThan(0.1);
  expect(await page.evaluate(() => windRunning)).toBe(false); // no frame is spent on a flag at rest
});

test('G1: reduced motion leaves the flags without a transform', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page, 'customer');
  await page.hover('#sve');
  await page.waitForTimeout(300);
  expect(await page.$$eval('footer .languages', (a) => a.map((e) => e.style.transform))).toEqual(['', '', '', '', '']);
});

test('S6: reduced motion lays lines and hangs flags still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page, 'customer');
  await page.locator('.drink').first().click();
  await page.click('#sve');
  expect(await anims(page, '#drink_selection .order')).toEqual([]);
  expect(await anims(page, '#sve .languages')).toEqual([]);
});

// S7: the Sound plate, on every page
const enter = async (page, role, lang = 0) => { // staff buttons are hidden on phones, so click them in script, as tests/mobile.spec.js does
  await page.goto('/index.html');
  await page.evaluate((l) => localStorage.setItem('index', l), lang);
  await page.reload();
  if (role == 'index') return;
  await page.evaluate((id) => document.getElementById(id).click(), role);
  await page.fill('#user_name_input', 'test');
  await page.fill('#password_input', 'test');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/' + role + '.html');
};
const PAGES = ['index', 'customer', 'bartender', 'management'];

for (const role of PAGES) {
  test(`S7: ${role} has one Sound plate, off at first, named in the page language, saved across reloads`, async ({ page }) => {
    await enter(page, role);
    const plate = page.locator('#sound');
    await expect(plate).toHaveCount(1);
    expect(await plate.evaluate((e) => e.tagName)).toBe('BUTTON');
    await expect(plate).toHaveAttribute('aria-pressed', 'false');
    await expect(plate).toHaveText('Sound');
    await page.click('#sve');
    await expect(plate).toHaveText('Ljud');
    await page.click('#eng');
    await page.focus(role == 'index' ? '#pirate' : '#logout'); // the plate follows Log Out, or the flags on the landing page
    await page.keyboard.press('Tab');
    await expect(plate).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(plate).toHaveAttribute('aria-pressed', 'true');
    expect(await plate.locator('use').getAttribute('href')).toBe('img/icons.svg#bell');
    await page.reload();
    await expect(plate).toHaveAttribute('aria-pressed', 'true');
    if (role != 'index') {
      await page.evaluate(() => logOut());
      await page.waitForURL('**/index.html');
      expect(await page.evaluate(() => localStorage.getItem('SOUND'))).toBe('on'); // a log out keeps the choice, like the stock order number
    }
    await page.focus('#sound');
    await page.keyboard.press('Space');
    await expect(plate).toHaveAttribute('aria-pressed', 'false');
    expect(await plate.locator('use').getAttribute('href')).toBe('img/icons.svg#bell-off');
  });

  test(`S7: ${role} with the Sound plate has no axe violations`, async ({ page }) => {
    await enter(page, role);
    await axe(page);
  });

  test(`S7: ${role} Sound plate fits at 320 and 375 px in every language, 44 px high, clear of the other plates`, async ({ page }) => {
    await enter(page, role);
    for (const w of [320, 375]) {
      await page.setViewportSize({ width: w, height: 800 });
      for (let l = 0; l < 5; l++) {
        await page.evaluate((l) => { localStorage.setItem('index', l); setLanguage(l); }, l);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${w} px, language ${l}`).toBe(true);
        const hit = await page.evaluate(() => {
          const r = (e) => e.getBoundingClientRect(), s = r(document.querySelector('#sound'));
          return { h: s.height, left: s.left, right: s.right, over: [...document.querySelectorAll('footer button, footer a, #logout_phone')].filter((e) => e.id != 'sound' && e.offsetParent).filter((e) => { const o = r(e); return o.left < s.right - 1 && s.left < o.right - 1 && o.top < s.bottom - 1 && s.top < o.bottom - 1; }).map((e) => e.id || e.className) };
        });
        expect(hit.h, `${w} px, language ${l}`).toBeGreaterThanOrEqual(44);
        expect(hit.left).toBeGreaterThanOrEqual(0);
        expect(hit.right).toBeLessThanOrEqual(w);
        expect(hit.over, `${w} px, language ${l}`).toEqual([]);
      }
    }
  });
}

for (const role of ['customer', 'bartender', 'management']) {
  test(`S7: ${role} Sound plate stays inside the footer row at 769, 1024 and 1280 px in English and Spanish`, async ({ page }) => {
    await enter(page, role);
    for (const w of [769, 1024, 1280]) {
      await page.setViewportSize({ width: w, height: 800 });
      for (const l of [0, 3]) {
        await page.evaluate((l) => { localStorage.setItem('index', l); setLanguage(l); }, l);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${w} px, language ${l}`).toBe(true);
        expect(await page.evaluate(() => {
          const s = document.querySelector('#sound').getBoundingClientRect();
          return [...document.querySelectorAll('footer button, footer a')].filter((e) => e.id != 'sound' && e.offsetParent).filter((e) => { const o = e.getBoundingClientRect(); return o.left < s.right - 1 && s.left < o.right - 1 && o.top < s.bottom - 1 && s.top < o.bottom - 1; }).map((e) => e.id);
        }), `${w} px, language ${l}`).toEqual([]);
      }
    }
  });
}

// S8: sound(), the cues. play() is replaced by a recorder, so no real audio is needed
const record = (page, on = true) => page.addInitScript((on) => {
  window.played = [];
  HTMLMediaElement.prototype.play = function () { window.played.push(this.src.split('/').pop()); return Promise.resolve(); };
  if (on) localStorage.setItem('SOUND', 'on');
}, on);
const played = (page) => page.evaluate(() => window.played);
const waitPlayed = (page, want) => expect.poll(() => played(page), { timeout: 3000 }).toEqual(want);

for (const role of PAGES) {
  test(`S8: ${role} plays nothing on load, even with sound on`, async ({ page }) => {
    await record(page);
    await enter(page, role);
    await page.reload();
    await page.waitForTimeout(800);
    expect(await played(page)).toEqual([]);
  });
}

test('S8: bartender cues, each on its event and only with sound on', async ({ page }) => {
  await record(page);
  await login(page, 'bartender');
  await inject(page, 'T99998');
  await expect(page.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
  await waitPlayed(page, ['bell.mp3']);
  await inject(page, 'T99999'); // a second order in the same batch rings nothing
  await page.waitForTimeout(2500);
  expect(await played(page)).toEqual(['bell.mp3']);
  await page.click('#retrieve_orders'); // two cards dealt, one sound
  await waitPlayed(page, ['bell.mp3', 'deal.mp3']);
  await page.waitForTimeout(500);
  expect(await played(page)).toEqual(['bell.mp3', 'deal.mp3']);
  await page.evaluate(() => { window.played = []; });
  await page.locator('.accordion#T00020').click();
  await page.locator('.pay#T00020').click();
  await waitPlayed(page, ['coin.mp3', 'stamp.mp3']); // the stamp comes after the glide
  await page.evaluate(() => { window.played = []; });
  await page.locator('.accordion#T00018').click();
  await page.locator('.delete#T00018').click();
  await waitPlayed(page, ['flick.mp3']);
  await page.evaluate(() => { window.played = []; });
  await page.click('#undo'); await page.click('#redo'); await page.click('#unpaid'); await page.click('#sve'); // none of these has a cue
  await page.waitForTimeout(800);
  expect(await played(page)).toEqual([]);
});

test('S8: bartender with sound off plays nothing', async ({ page }) => {
  await record(page, false);
  await login(page, 'bartender');
  await inject(page, 'T99998');
  await expect(page.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
  await page.click('#retrieve_orders');
  await page.locator('.accordion#T00020').click();
  await page.locator('.pay#T00020').click();
  await page.locator('.accordion#T00018').click();
  await page.locator('.delete#T00018').click();
  await page.waitForTimeout(800);
  expect(await played(page)).toEqual([]);
});

test('S8: management plays the stamp for a placed stock order', async ({ page }) => {
  await record(page);
  await placeStockOrder(page);
  await waitPlayed(page, ['stamp.mp3']);
});

test('S8: management with sound off plays nothing', async ({ page }) => {
  await record(page, false);
  await placeStockOrder(page);
  await page.waitForTimeout(800);
  expect(await played(page)).toEqual([]);
});

test('S8: every cue called in js has a file under 1 s', () => {
  const names = new Set();
  for (const f of fs.readdirSync('js').filter((f) => f.endsWith('.js'))) for (const m of fs.readFileSync('js/' + f, 'utf8').matchAll(/\bsound\("(\w+)"\)/g)) names.add(m[1]);
  expect([...names].sort()).toEqual(['bell', 'coin', 'deal', 'flick', 'stamp']);
  for (const n of names) {
    const s = parseFloat(require('child_process').execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `audio/${n}.mp3`]).toString());
    expect(s, n).toBeLessThan(1);
  }
});

test('S8: the screen reader hears the same with sound on and off', async ({ page }) => {
  const run = async (on) => {
    const p = await page.context().newPage();
    await record(p, on);
    await login(p, 'bartender');
    await startSR(p);
    await inject(p, 'T99998');
    await expect(p.locator('#retrieve_orders')).toHaveClass(/has-new/, { timeout: 5000 });
    await p.click('#retrieve_orders');
    await p.locator('.accordion#T00020').click();
    await p.locator('.pay#T00020').click();
    await p.locator('.accordion#T00018').click();
    await p.locator('.delete#T00018').click();
    const log = await heard(p);
    await p.close();
    return log;
  };
  const off = await run(false);
  expect(off.length).toBeGreaterThan(0);
  expect(await run(true)).toEqual(off);
});

const noActivation = (page, active) => page.addInitScript((active) => Object.defineProperty(navigator, 'userActivation', { value: { hasBeenActive: active }, configurable: true }), active);

test('S8: the wait note shows while sound is on but audio is not yet allowed, and goes at the first key', async ({ page }) => {
  await noActivation(page, false);
  await record(page);
  await enter(page, 'bartender');
  const note = page.locator('#sound_wait');
  await expect(note).toHaveText('Sound starts after your first click.');
  expect(await note.evaluate((e) => { const n = e.getBoundingClientRect(), s = document.getElementById('sound').getBoundingClientRect(); return n.bottom <= s.top && n.left >= 0 && n.right <= innerWidth; })).toBe(true);
  await page.evaluate(() => setLanguage(3));
  await expect(note).toHaveText('El sonido empieza después de tu primer clic.');
  await page.keyboard.press('Tab');
  await expect(note).toBeHidden();
});

test('S8: no wait note once audio is allowed', async ({ page }) => {
  await noActivation(page, true);
  await record(page);
  await enter(page, 'bartender');
  await expect(page.locator('#sound_wait')).toBeHidden();
});

test('S8: no wait note while sound is off', async ({ page }) => {
  await noActivation(page, false);
  await record(page, false);
  await enter(page, 'bartender');
  await expect(page.locator('#sound_wait')).toBeHidden();
});

// S8b: the customer ambience loop
const recordAll = (page, on = true) => page.addInitScript((on) => {
  window.played = [];
  HTMLMediaElement.prototype.play = function () { window.played.push(this.src.split('/').pop()); return Promise.resolve(); };
  HTMLMediaElement.prototype.pause = function () { window.played.push('pause'); };
  if (on) localStorage.setItem('SOUND', 'on');
}, on);
const press = (page) => page.mouse.click(2, 2); // a press on bare page

test('S8b: ambience file is about 60 s and under 600 KB', () => {
  const s = parseFloat(require('child_process').execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'audio/ambience.mp3']).toString());
  expect(s).toBeGreaterThan(55);
  expect(s).toBeLessThan(65);
  expect(fs.statSync('audio/ambience.mp3').size).toBeLessThan(600000);
});

test('S8b: ambience does not play on load, starts at the first press, loops at 0.25', async ({ page }) => {
  await recordAll(page);
  await enter(page, 'customer');
  await page.reload();
  await expect(page.locator('#drink_database')).not.toHaveClass(/intro/, { timeout: 10000 }); // V12b G3: the first-load intro has ended
  await page.waitForTimeout(800);
  expect(await played(page)).toEqual([]);
  await press(page);
  await waitPlayed(page, ['ambience.mp3']);
  expect(await page.evaluate(() => [ambience.loop, ambience.volume])).toEqual([true, 0.25]);
});

test('S8b: a first key starts it too, but not the key that turns the plate off', async ({ page }) => {
  await recordAll(page);
  await enter(page, 'customer');
  await page.reload();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true'); // the page script has run
  await expect(page.locator('#drink_database')).not.toHaveClass(/intro/, { timeout: 10000 }); // V12b G3: the first-load intro has ended
  await page.keyboard.press('Shift');
  await waitPlayed(page, ['ambience.mp3']);
  const other = await page.context().newPage();
  await recordAll(other);
  await other.goto('/customer.html');
  await other.focus('#sound');
  await other.keyboard.press('Enter');
  await other.waitForTimeout(500);
  expect(await played(other)).toEqual(['pause']); // turned off: nothing ever started
});

test('S8b: the plate starts and stops it', async ({ page }) => {
  await recordAll(page, false);
  await enter(page, 'customer');
  await page.click('#sound');
  await waitPlayed(page, ['ambience.mp3']);
  await page.click('#sound');
  await waitPlayed(page, ['ambience.mp3', 'pause']);
  await page.click('#sound');
  await waitPlayed(page, ['ambience.mp3', 'pause', 'ambience.mp3']);
});

test('S8b: a hidden tab pauses it and a visible tab resumes it, only while on', async ({ page }) => {
  await recordAll(page, false);
  await enter(page, 'customer');
  await page.click('#sound');
  await waitPlayed(page, ['ambience.mp3']);
  const tab = (hidden) => page.evaluate((hidden) => { Object.defineProperty(document, 'hidden', { value: hidden, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, hidden);
  await tab(true);
  await waitPlayed(page, ['ambience.mp3', 'pause']);
  await tab(false);
  await waitPlayed(page, ['ambience.mp3', 'pause', 'ambience.mp3']);
  await page.click('#sound'); // off
  await tab(true); await tab(false);
  await waitPlayed(page, ['ambience.mp3', 'pause', 'ambience.mp3', 'pause', 'pause', 'pause']);
});

for (const role of ['index', 'bartender', 'management']) {
  test(`S8b: the Sound plate on ${role} plays no ambience`, async ({ page }) => {
    await recordAll(page, false);
    await enter(page, role);
    await page.click('#sound');
    await press(page);
    await page.waitForTimeout(500);
    expect(await played(page)).toEqual([]);
  });
}

test('S8b: the screen reader hears the same on the customer page with ambience on and off', async ({ page }) => {
  const run = async (on) => {
    const p = await page.context().newPage();
    await recordAll(p, on);
    await login(p, 'customer');
    await startSR(p);
    await p.keyboard.press('Shift');
    await p.locator('.drink').first().click();
    const log = await heard(p);
    await p.close();
    return log;
  };
  const off = await run(false);
  expect(off.length).toBeGreaterThan(0);
  expect(await run(true)).toEqual(off);
});

// V12b ghost motion (docs/ghost-motion-plan.md)
test('G0: ghost tokens', async ({ page }) => {
  await page.goto('/index.html');
  const v = await page.evaluate(() => { const c = getComputedStyle(document.documentElement); return ['--ghost-tint', '--ghost-blur', '--ghost-form', '--ghost-open', '--ghost-close', '--fog-pass', '--page-out', '--page-in', '--bone'].map((n) => c.getPropertyValue(n).trim()); });
  expect(v).toEqual(['sepia(1) hue-rotate(110deg) saturate(0.5) brightness(1.5)', '8px', '500ms', '900ms', '400ms', '1400ms', '700ms', '900ms', '#b9b59c']);
});

test('G0: sound() takes an optional volume, default 0.6', async ({ page }) => {
  await page.addInitScript(() => {
    window.vols = [];
    HTMLMediaElement.prototype.play = function () { window.vols.push(this.volume); return Promise.resolve(); };
    localStorage.setItem('SOUND', 'on');
  });
  await page.goto('/index.html');
  await page.evaluate(() => { sound('bell'); sound('foghorn', 0.8); });
  expect(await page.evaluate(() => window.vols)).toEqual([0.6, 0.8]);
});

test('G0: the five picked ghost cues are in audio/', () => {
  for (const n of ['paper-flap', 'creepy-long', 'creepy-tab', 'foghorn', 'ghost-whoosh']) expect(fs.existsSync(`audio/${n}.mp3`), n).toBe(true);
});

const slipRot = (page, id) => page.$eval(id, (e) => parseFloat(/rotate\(([-\d.]+)deg/.exec(e.style.transform)?.[1] || 0));

test('G2: a hovered slip swings, its neighbour follows, both rest by 4.2 s and keep their tilt', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/index.html');
  await page.hover('#about');
  await page.waitForTimeout(300);
  expect(Math.abs(await slipRot(page, '#about'))).toBeGreaterThan(0.3);
  expect(Math.abs(await slipRot(page, '#passwords'))).toBeGreaterThan(0.05);
  await page.mouse.move(400, 500);
  await page.waitForTimeout(4200);
  expect(Math.abs(await slipRot(page, '#about'))).toBeLessThan(0.1);
  expect(Math.abs(await slipRot(page, '#passwords'))).toBeLessThan(0.1);
  expect(await page.$eval('#about', (e) => getComputedStyle(e).rotate)).toBe('-2deg'); // the base tilt is the rotate property
  expect(await page.$eval('#passwords', (e) => getComputedStyle(e).rotate)).toBe('1.5deg');
  expect(await page.$eval('#about', (e) => getComputedStyle(e).transitionDuration)).toBe('0s'); // no hover drop
});

test('G2: the slips feel different: About is slower than Passwords', async ({ page }) => {
  await page.goto('/index.html');
  const f = await page.evaluate(() => springs.filter((s) => s.el.id).map((s) => [s.el.id, s.k, s.c, s.f, !!s.flutter]));
  expect(f).toEqual([['about', 14, 2.6, 330, false], ['passwords', 26, 2.8, 190, true]]);
});

test('G2: paper-flap plays once for a sweep over both slips, at 0.35', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push([this.src.split('/').pop(), this.volume]); return Promise.resolve(); };
    localStorage.setItem('SOUND', 'on');
  });
  await page.goto('/index.html');
  await page.evaluate(() => { // script events: page.hover waits for a moving slip to rest, which is longer than the limit
    for (const id of ['about', 'passwords', 'about']) { const e = document.getElementById(id); e.dispatchEvent(new PointerEvent('pointerenter')); e.dispatchEvent(new PointerEvent('pointerleave')); }
  });
  expect(await page.evaluate(() => window.played)).toEqual([['paper-flap.mp3', 0.35]]);
  await page.waitForTimeout(2600);
  await page.evaluate(() => document.getElementById('about').dispatchEvent(new PointerEvent('pointerenter')));
  expect(await page.evaluate(() => window.played.length)).toBe(2); // and again after 2.5 s
});

test('G2: no wind on phones, and none under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/index.html');
  await page.evaluate(() => document.querySelector('#about').dispatchEvent(new PointerEvent('pointerenter')));
  await page.waitForTimeout(300);
  expect(await page.$eval('#about', (e) => e.style.transform)).toBe('');
  const p2 = await page.context().newPage();
  await p2.emulateMedia({ reducedMotion: 'reduce' });
  await p2.goto('/index.html');
  await p2.hover('#about');
  await p2.waitForTimeout(300);
  expect(await p2.$$eval('#about, #passwords', (a) => a.map((e) => e.style.transform))).toEqual(['', '']);
});

test('G2: under reduced motion a hovered or focused slip sits 4px lower at once, and a narrow window keeps the phone buttons still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  const shift = () => page.$eval('#about', (e) => getComputedStyle(e).translate);
  expect(await shift()).toBe('none');
  await page.hover('#about');
  expect(await shift()).toBe('0px 4px');
  await page.mouse.move(400, 600);
  await page.keyboard.press('Tab');
  await page.focus('#about');
  expect(await shift()).toBe('0px 4px');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => { document.querySelector('#about').style.transform = 'rotate(4deg)'; }); // the wind, started before the window was narrowed
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.$eval('#about', (e) => getComputedStyle(e).transform)).toBe('none');
});

test('G2: a slip opens its window and the wind settles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/index.html');
  await page.click('#passwords');
  await expect(page.locator('#passwords_window')).toBeVisible();
  await page.mouse.move(400, 600);
  await page.waitForTimeout(4200);
  expect(Math.abs(await slipRot(page, '#passwords'))).toBeLessThan(0.1);
});

const DIALOGS = [['login', '#loginBox', (page) => page.evaluate(() => openLogin('loginBox', 'block', 'customer'))], ['About', '#about_window', (page) => page.click('#about')], ['Passwords', '#passwords_window', (page) => page.click('#passwords')]];
for (const [name, sel, open] of DIALOGS) {
  test(`G6: the ${name} dialog condenses open in 900 ms and dissolves in 400 ms`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/index.html');
    const st = () => page.$eval(sel, (e) => { const c = getComputedStyle(e); return { o: c.opacity, v: c.visibility, f: c.filter, s: c.scale, d: c.transitionDuration, ov: getComputedStyle(document.getElementById('overlay')).opacity }; });
    expect(await st()).toMatchObject({ o: '0', v: 'hidden', s: '1.03' });
    expect((await st()).f).toContain('blur(8px)');
    await open(page);
    expect((await st()).d).toBe('0.9s, 0.9s, 0.9s, 0s');
    await page.waitForTimeout(1100);
    expect(await st()).toMatchObject({ o: '1', v: 'visible', f: 'none', s: 'none', ov: '1' });
    await page.evaluate((sel) => { if (sel == '#loginBox') closeLogin(); else document.querySelector(sel + ' .close_window').click(); }, sel);
    await page.waitForTimeout(150);
    expect((await st()).v).toBe('visible'); // still dissolving
    await page.waitForTimeout(600);
    expect(await st()).toMatchObject({ o: '0', v: 'hidden' });
  });
}

test('G6: the login input has focus right after the dialog opens, and the mist puff runs 1.4 s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/index.html');
  await page.evaluate(() => openLogin('loginBox', 'block', 'customer'));
  expect(await page.evaluate(() => document.activeElement.id)).toBe('user_name_input');
  const a = await page.evaluate(() => { const c = getComputedStyle(document.getElementById('overlay'), '::after'); return [c.animationName, c.animationDuration]; });
  expect(a).toEqual(['mist-pass', '1.4s']);
});

test('G6: a hidden dialog adds no scroll', async ({ page }) => {
  for (const w of [320, 375, 1280]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('/index.html');
    expect(await page.evaluate(() => [document.documentElement.scrollWidth <= innerWidth, document.documentElement.scrollHeight <= innerHeight]), `${w} px`).toEqual([true, true]);
  }
});

test('G6: ghost-whoosh plays at 0.7 when a dialog opens, not when it closes', async ({ page }) => {
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push([this.src.split('/').pop(), this.volume]); return Promise.resolve(); };
    localStorage.setItem('SOUND', 'on');
  });
  await page.goto('/index.html');
  await page.evaluate(() => openLogin('loginBox', 'block', 'customer'));
  await page.evaluate(() => closeLogin());
  expect(await page.evaluate(() => window.played)).toEqual([['ghost-whoosh.mp3', 0.7]]);
});

test('G6: reduced motion fades opacity only: no blur, no scale, no puff', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  for (const [, sel, open] of DIALOGS) {
    await open(page);
    expect(await page.$eval(sel, (e) => { const c = getComputedStyle(e); return [c.filter, c.scale, c.transitionProperty.split(', ').filter((p, i, a) => a.indexOf(p) == i).sort().join()]; }), sel).toEqual(['none', 'none', 'opacity,visibility']);
    await page.reload();
  }
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('overlay'), '::after').display)).toBe('none');
});

// G5: the page change through the fog (docs/ghost-motion-plan.md)
test('G5: the fog is CSS on tokens, only when motion is allowed', () => {
  const css = fs.readFileSync('css/style.css', 'utf8');
  expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*@view-transition \{ navigation: auto; types: page; \}/);
  expect(css).toMatch(/--page-delay: 500ms;/);
  expect(css).toMatch(/:active-view-transition-type\(page\)::view-transition-old\(root\) \{ animation: breathe-out var\(--page-out\) ease-in forwards/);
  expect(css).toMatch(/:active-view-transition-type\(page\)::view-transition-new\(root\) \{ animation: condense var\(--page-in\) var\(--toast-ease\) var\(--page-delay\) backwards/);
});

test('G5: a mist bank crosses a page that arrived through a view transition, and only then', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => dispatchEvent(new Event('pagereveal'))); // plain load: no view transition
  expect(await page.locator('.mist_bank').count()).toBe(0);
  await page.evaluate(() => {
    const e = new Event('pagereveal');
    window.finish = () => {};
    Object.defineProperty(e, 'viewTransition', { value: { finished: new Promise((r) => { window.finish = r; }) } });
    dispatchEvent(e);
  });
  const bank = page.locator('.mist_bank');
  await expect(bank).toHaveAttribute('aria-hidden', 'true');
  expect(await bank.evaluate((e) => { const c = getComputedStyle(e); return [c.animationName, c.animationDuration, c.pointerEvents, c.position]; })).toEqual(['mist-pass', '1.4s', 'none', 'fixed']);
  await page.evaluate(() => window.finish());
  await expect(bank).toHaveCount(0); // the bank is removed when the transition ends
});

test('G5: a login arrives through the fog in Chromium: type page, old page sinks, new one condenses', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Firefox has no cross-document view transitions and loads plainly');
  await page.addInitScript(() => addEventListener('pagereveal', (e) => {
    window.reveal = { types: e.viewTransition ? [...e.viewTransition.types] : null };
    setTimeout(() => { window.reveal.anims = document.getAnimations().map((a) => String(a.animationName)); }, 300);
  }));
  await login(page, 'customer');
  await expect.poll(() => page.evaluate(() => window.reveal && window.reveal.anims)).toBeTruthy();
  const r = await page.evaluate(() => window.reveal);
  expect(r.types).toEqual(['page']);
  expect(r.anims).toEqual(expect.arrayContaining(['breathe-out', 'condense']));
});

test('G5: the bartender page arrives with the page, its cards do not take their own layers', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Firefox has no cross-document view transitions');
  await page.addInitScript(() => addEventListener('pagereveal', () => {
    setTimeout(() => { window.layers = document.getAnimations().map((a) => a.effect.pseudoElement || '').filter((p) => /view-transition-new\(T/.test(p)); window.fog = document.getAnimations().map((a) => String(a.animationName)); }, 300);
  }));
  await login(page, 'bartender');
  await expect.poll(() => page.evaluate(() => window.layers)).toEqual([]);
  expect(await page.evaluate(() => window.fog)).toEqual(expect.arrayContaining(['breathe-out', 'condense'])); // css/bartender.css's plain root rule must not beat the fog
});

// the foghorn: a stub records each cue with its volume in sessionStorage, which outlives the page that leaves. goToUserPage and logOut play it on the old page, then wait 2900 ms (the horn lasts 2.85 s and leaving the page stops it)
const recordVolumes = (page, on) => page.addInitScript((on) => {
  HTMLMediaElement.prototype.play = function () { sessionStorage.setItem('cues', JSON.stringify(JSON.parse(sessionStorage.getItem('cues') || '[]').concat([[this.src.split('/').pop(), this.volume]]))); return Promise.resolve(); };
  if (on) localStorage.setItem('SOUND', 'on'); else localStorage.removeItem('SOUND');
  localStorage.setItem('usertype', 'customer');
}, on);
const cues = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('cues') || '[]'));
const departs = [['a login', "goToUserPage('customer')", 'customer.html', 'index.html'], ['a log out', 'logOut()', 'index.html', 'customer.html']];
const timersOf = (page, go) => page.evaluate((src) => { // the delays of the timers the call sets, read before the page leaves
  const real = window.setTimeout, delays = [];
  window.setTimeout = (f, ms) => { delays.push(ms); return real(f, ms); };
  eval(src);
  return delays;
}, go);
for (const [name, go, to, from] of departs) {
  test(`G5: ${name} with Sound on plays the foghorn at 0.8, and the page leaves after the whole horn (2900 ms)`, async ({ page }) => {
    await recordVolumes(page, true);
    await page.goto('/' + from);
    await page.evaluate(() => localStorage.setItem('usertype', 'customer'));
    const t0 = Date.now();
    expect(await timersOf(page, go)).toEqual([2900]);
    await page.waitForURL('**/' + to, { waitUntil: 'commit' });
    expect(Date.now() - t0).toBeGreaterThanOrEqual(2850);
    expect(Date.now() - t0).toBeLessThan(6000); // the timer above pins the 2900 ms; this only catches a stuck page, and a loaded machine adds time
    expect(await cues(page)).toEqual([['foghorn.mp3', 0.8]]);
  });

  test(`G5: ${name} with Sound off leaves at once and plays nothing`, async ({ page }) => {
    await recordVolumes(page, false);
    await page.goto('/' + from);
    await page.evaluate(() => localStorage.setItem('usertype', 'customer'));
    expect(await timersOf(page, go)).toEqual([]); // no timer, so no wait
    await page.waitForURL('**/' + to, { waitUntil: 'commit' });
    expect(await cues(page)).toEqual([]);
  });
}

test('G5: during the horn wait the page fades into the fog and a mist bank crosses it', async ({ page }) => {
  await recordVolumes(page, true);
  await page.goto('/index.html');
  await page.evaluate(() => depart('customer.html'));
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => ({ departing: document.documentElement.classList.contains('departing'), body: +getComputedStyle(document.body).opacity, banks: document.querySelectorAll('.mist_bank').length }));
  expect(s.departing).toBe(true);
  expect(s.body).toBeLessThan(0.9); // fading, not frozen
  expect(s.banks).toBe(1);
  await page.waitForURL('**/customer.html');
});

test('G5: an access-denied redirect has no foghorn, even with Sound on', async ({ page }) => {
  await recordVolumes(page, true);
  await page.goto('/management.html');
  await page.waitForURL('**/customer.html');
  expect(await cues(page)).toEqual([]); // depart() would have played it before leaving
});

test('G5: reduced motion drops the fog but keeps the foghorn, because sound is not motion', async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => addEventListener('pagereveal', (e) => { sessionStorage.setItem('vt', String(!!e.viewTransition)); }));
  await recordVolumes(page, true);
  await page.goto('/index.html');
  await page.evaluate(() => goToUserPage('customer'));
  await page.waitForURL('**/customer.html');
  expect(await cues(page)).toEqual([['foghorn.mp3', 0.8]]);
  expect(await page.evaluate(() => sessionStorage.getItem('vt'))).not.toBe('true'); // Firefox never sets it; Chromium sets "false" with the rule inside no-preference
  expect(await page.locator('.mist_bank').count()).toBe(0);
});

// G3: the skull of smoke on the first load of a drink list (customer and management)
const LISTS = [['customer', '.drink', '.beers'], ['management', '.drink', '#specials_db']];
const introState = (page) => page.evaluate(() => ({
  skull: document.querySelectorAll('.skull').length,
  wisps: document.querySelectorAll('.wisp').length,
  filter: !!document.getElementById('smoke'),
  intro: document.getElementById('drink_database').classList.contains('intro'),
  events: getComputedStyle(document.getElementById('drink_database')).pointerEvents,
  hidden: [...document.querySelectorAll('#drink_database .drink')].filter((c) => getComputedStyle(c).opacity !== '1').length,
  cards: document.querySelectorAll('#drink_database .drink').length,
}));

test('G3: the timeline tokens, the skull drawing and its record', () => {
  const css = fs.readFileSync('css/style.css', 'utf8');
  expect(css).toMatch(/--ghost-blow: 2700ms;/);
  expect(css).toMatch(/--ghost-wait: 3100ms;/);
  expect(css).toMatch(/--ghost-stagger: 40ms;/);
  expect(fs.existsSync('img/skull.svg')).toBe(true);
  expect(fs.existsSync('docs/visual-options/skull.svg')).toBe(false);
  expect(fs.readFileSync('docs/ASSETS.md', 'utf8')).toContain('`img/skull.svg`');
});

for (const [role, card, tab] of LISTS) {
  test(`G3: ${role} opens with the skull and hidden cards, and 4.5 s later only the cards are left`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await enter(page, role);
    const s = await introState(page);
    expect(s).toMatchObject({ skull: 1, filter: true, intro: true, events: 'none' });
    expect(s.cards).toBeGreaterThan(8); // the cards are in the DOM from the start
    expect(s.hidden).toBe(s.cards);
    expect(s.wisps).toBeGreaterThan(0);
    expect(s.wisps).toBeLessThanOrEqual(s.cards); // only the cards in view get a wisp
    expect(await anims(page, '#drink_database ' + card)).toMatchObject([{ name: 'ghost-in', dur: 500, delay: 3100 }]);
    await page.waitForTimeout(4500);
    expect(await introState(page)).toMatchObject({ skull: 0, wisps: 0, intro: false, events: 'auto', hidden: 0 });
    expect(await anims(page, '#drink_database ' + card)).toEqual([]);
  });

  test(`G3: ${role}: a key at 1 s ends the intro at once`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await enter(page, role);
    await page.waitForTimeout(1000);
    expect((await introState(page)).skull).toBe(1);
    await page.keyboard.press('Shift');
    expect(await introState(page)).toMatchObject({ skull: 0, wisps: 0, intro: false, events: 'auto', hidden: 0 });
  });
}

test('G3: a press during the intro ends it and does not click the hidden card under it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enter(page, 'customer');
  const box = await page.locator('#drink_database .drink').first().boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  expect(await introState(page)).toMatchObject({ skull: 0, intro: false });
  await expect(page.locator('#drink_selection .order')).toHaveCount(0);
});

test('G3: the cue joins where it would be on the first press, only while the skull is there and Sound is on', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push([this.src.split('/').pop(), this.volume, this.currentTime]); return Promise.resolve(); };
    localStorage.setItem('SOUND', 'on');
  });
  await enter(page, 'customer');
  await page.waitForTimeout(1000);
  await page.keyboard.press('Shift');
  const [[name, volume, at]] = await page.evaluate(() => window.played.filter((p) => p[0] == 'creepy-long.mp3'));
  expect([name, volume]).toEqual(['creepy-long.mp3', 0.8]);
  expect(at).toBeGreaterThan(0.8); // about 1 s in
  expect(at).toBeLessThan(2.5);
  await page.keyboard.press('Shift');
  expect(await page.evaluate(() => window.played.filter((p) => p[0] == 'creepy-long.mp3').length)).toBe(1); // once
});

test('G3: no cue after the skull is gone, and none with Sound off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push(this.src.split('/').pop()); return Promise.resolve(); };
    if (location.pathname.endsWith('customer.html')) localStorage.setItem('SOUND', sessionStorage.getItem('sound') || 'off');
  });
  await enter(page, 'customer'); // Sound off: a press at 1 s plays nothing
  await page.waitForTimeout(1000);
  await page.keyboard.press('Shift');
  expect(await page.evaluate(() => window.played)).toEqual([]);
  await page.evaluate(() => { localStorage.setItem('SOUND', 'on'); sessionStorage.setItem('sound', 'on'); });
  await page.reload(); // Sound on, but the press comes after the skull is gone
  await page.waitForTimeout(4500);
  await page.keyboard.press('Shift');
  expect(await page.evaluate(() => window.played.filter((p) => p == 'creepy-long.mp3'))).toEqual([]);
});

test('G3: a tab switch has no skull, no wisps and no card animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enter(page, 'customer');
  await page.keyboard.press('Shift'); // end the intro
  await page.click('.beers');
  expect(await introState(page)).toMatchObject({ skull: 0, wisps: 0, intro: false });
  expect(await anims(page, '#drink_database .drink')).toEqual([]);
});

test('G3: reduced motion has no skull and no wisps, and the cards fade in over 250 ms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { // the intro lasts 250 ms, so the animation is read the moment the class is added
    new MutationObserver(() => { const s = getComputedStyle(document.querySelector('#drink_database .drink')); window.fade = window.fade || [s.animationName, s.animationDuration, s.animationDelay]; })
      .observe(document.getElementById('drink_database'), { attributes: true, attributeFilter: ['class'] });
  }));
  await enter(page, 'customer');
  expect(await introState(page)).toMatchObject({ skull: 0, wisps: 0, filter: false });
  expect(await page.evaluate(() => window.fade)).toEqual(['card-fade', '0.25s', '0s']);
  await expect.poll(async () => (await introState(page)).intro).toBe(false);
});

test('G3: the cards are in the DOM from the start, so the virtual screen reader reads them while the skull is there', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enter(page, 'customer');
  expect((await introState(page)).skull).toBe(1);
  await startSR(page);
  await page.evaluate(async () => { for (let i = 0; i < 400 && !/Heineken/.test(await sr.lastSpokenPhrase()); i++) await sr.next(); });
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/Heineken/);
});

test('G3: pressing the Sound plate during the skull ends the intro but plays no cue', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push(this.src.split('/').pop()); return Promise.resolve(); };
    localStorage.setItem('SOUND', 'on');
  });
  await enter(page, 'customer');
  await page.waitForTimeout(500);
  await page.focus('#sound');
  await page.keyboard.press('Enter'); // turns Sound off
  expect(await introState(page)).toMatchObject({ skull: 0, intro: false });
  expect(await page.evaluate(() => window.played.filter((p) => p == 'creepy-long.mp3'))).toEqual([]);
});

// G4: the spectral trail on a tab switch (customer and management)
const calm = async (page, role) => { // in on the list with the intro over and the page fog gone, so nothing else moves
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enter(page, role);
  await page.keyboard.press('Shift');
  await page.evaluate(() => document.activeViewTransition && document.activeViewTransition.finished);
};
const swapState = (page) => page.evaluate(() => ({
  layers: document.querySelectorAll('.swap_fx').length,
  clones: document.querySelectorAll('.swap_fx .drink').length,
  cards: document.querySelectorAll('#drink_database > .drink').length,
  height: document.getElementById('drink_database').scrollHeight,
}));
const timing = (el) => { const a = el.getAnimations()[0], t = a.effect.getTiming(); return [t.delay, t.duration, Number(a.effect.getKeyframes()[0].opacity)]; };

test('G4: every card carries its article id, on both pages', async ({ page }) => {
  for (const role of ['customer', 'management']) {
    await calm(page, role);
    const ids = await page.$$eval('#drink_database > .drink', (cs) => cs.map((c) => [c.dataset.id, c.querySelector('span[hidden]').textContent]));
    expect(ids.length).toBeGreaterThan(8);
    ids.forEach(([id, shown]) => expect(id).toBe(shown));
    expect(new Set(ids.map((i) => i[0])).size).toBe(ids.length);
  }
});

test('G4: All to Beers, where no card moves: echoes during the switch, gone 2.5 s later, and the cards match the filter', async ({ page }) => {
  await calm(page, 'customer');
  const beers = await page.evaluate(() => SESSION_STOCK_INFO.filter((d) => d.beer == true).length);
  const before = await swapState(page);
  await page.click('.beers');
  const s = await swapState(page);
  expect(s).toMatchObject({ layers: 1, cards: beers });
  expect(s.clones).toBeGreaterThanOrEqual(3);
  expect(s.clones % 3).toBe(0); // three echoes a card
  expect(s.clones).toBeLessThan(3 * beers); // only the cards in view, and a row more
  expect(await page.evaluate(() => { const l = document.querySelector('.swap_fx'); return [l.getAttribute('aria-hidden'), l.inert, getComputedStyle(l).pointerEvents]; })).toEqual(['true', true, 'none']);
  expect(await page.evaluate(() => document.querySelectorAll('.swap_fx [id]').length)).toBe(0); // no id twice
  await page.waitForTimeout(2500);
  expect(await swapState(page)).toMatchObject({ layers: 0, clones: 0, cards: beers });
  expect(before.cards).toBeGreaterThan(beers);
});

test('G4: a kept card goes pale and throws three echoes, at 0, 140 and 280 ms, rising as they fade', async ({ page }) => {
  await calm(page, 'customer');
  await page.click('.beers');
  const echoes = await page.$$eval('.swap_fx .drink', (cs, src) => cs.slice(0, 3).map(new Function('return ' + src)()), timing.toString());
  expect(echoes).toEqual([[0, 1200, 0.45], [140, 1100, 0.3], [280, 1000, 0.18]]);
  const card = await page.$eval('#drink_database > .drink', (c) => {
    const a = c.getAnimations()[0], t = a.effect.getTiming(), pale = a.effect.getKeyframes().find((k) => k.offset == 0.45);
    return { duration: t.duration, easing: t.easing, opacity: Number(pale.opacity), filter: pale.filter };
  });
  expect(card).toMatchObject({ duration: 1100, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', opacity: 0.45 });
  expect(card.filter).toContain('blur(2px)');
});

test('G4: leaving cards fade as ghosts for 700 ms and new cards condense over 800 ms, 30 ms apart', async ({ page }) => {
  await calm(page, 'customer');
  await page.click('.wines'); // the beers in view leave, the wines come in
  const s = await page.$$eval('.swap_fx .drink', (cs) => cs.map((c) => c.getAnimations()[0].effect.getTiming().duration));
  expect(s.length).toBeGreaterThan(0);
  s.forEach((d) => expect(d).toBe(700));
  const fresh = await page.$$eval('#drink_database > .drink', (cs) => cs.map((c) => c.getAnimations()).filter((a) => a.length).slice(0, 3).map((a) => { const t = a[0].effect.getTiming(); return [t.duration, t.delay]; }));
  expect(fresh).toEqual([[800, 360], [800, 390], [800, 420]]);
});

test('G4: a card clicked during the switch is ordered, so nothing blocks clicks', async ({ page }) => {
  await calm(page, 'customer');
  await page.click('.beers');
  expect((await swapState(page)).layers).toBe(1);
  await page.locator('#drink_database > .drink').first().click();
  await expect(page.locator('#drink_selection .order')).toHaveCount(1);
});

test('G4: management rows trail the same way, and the drink list does not stretch', async ({ page }) => {
  await calm(page, 'management');
  const mikes = await page.evaluate(() => DB_MIKES.length);
  const height = (await swapState(page)).height;
  await page.click('#specials_db'); // the Systembolaget rows in view leave
  const s = await swapState(page);
  expect(s).toMatchObject({ layers: 1, cards: mikes });
  expect(s.clones).toBeGreaterThan(0);
  expect(s.height).toBeLessThan(height); // the clones at the old seats do not stretch the scroll
  await page.waitForTimeout(2500);
  expect(await swapState(page)).toMatchObject({ layers: 0, clones: 0, cards: mikes });
  await page.click('#drinks_list'); // and back
  expect((await swapState(page)).layers).toBe(1);
  await page.waitForTimeout(2500);
  expect((await swapState(page)).layers).toBe(0);
});

test('G4: the same tab again does nothing, and a second switch mid-way leaves one layer', async ({ page }) => {
  await calm(page, 'customer');
  await page.click('.all'); // already there
  expect((await swapState(page)).layers).toBe(0);
  await page.click('.beers');
  await page.click('.wines');
  const wines = await page.evaluate(() => SESSION_STOCK_INFO.filter((d) => d.wine == true).length);
  expect(await swapState(page)).toMatchObject({ layers: 1, cards: wines });
  await page.waitForTimeout(2500);
  expect((await swapState(page)).layers).toBe(0);
});

test('G4: one creepy-tab at 0.5 per switch, none for the same tab again, none with Sound off', async ({ page }) => {
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push([this.src.split('/').pop(), this.volume]); return Promise.resolve(); };
    localStorage.setItem('SOUND', sessionStorage.getItem('sound') || 'on');
  });
  const tabs = () => page.evaluate(() => window.played.filter((p) => p[0] == 'creepy-tab.mp3'));
  await calm(page, 'customer');
  await page.click('.beers');
  expect(await tabs()).toEqual([['creepy-tab.mp3', 0.5]]);
  await page.click('.beers');
  expect((await tabs()).length).toBe(1);
  await page.click('.wines');
  expect((await tabs()).length).toBe(2);
  await page.evaluate(() => { localStorage.setItem('SOUND', 'off'); sessionStorage.setItem('sound', 'off'); });
  await page.click('.spirits');
  expect((await tabs()).length).toBe(2);
});

test('G4: reduced motion has no clones and no blur, and the new cards fade over 250 ms; the cue still plays', async ({ page }) => {
  await page.addInitScript(() => {
    window.played = [];
    HTMLMediaElement.prototype.play = function () { window.played.push(this.src.split('/').pop()); return Promise.resolve(); };
    localStorage.setItem('SOUND', 'on');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page, 'customer');
  await expect.poll(async () => (await introState(page)).intro).toBe(false);
  await page.click('.beers');
  const s = await swapState(page);
  expect(s).toMatchObject({ layers: 0, clones: 0 });
  const card = await page.$eval('#drink_database > .drink', (c) => { const s = getComputedStyle(c); return [s.animationName, s.animationDuration, s.filter.includes('blur')]; });
  expect(card).toEqual(['card-fade', '0.25s', false]);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSAnimation)).length)).toBe(0); // no Web Animation at all
  expect(await page.evaluate(() => window.played.filter((p) => p == 'creepy-tab.mp3').length)).toBe(1);
});

// B8: reduced motion, every G spot on every page. After each action the page has no blur, no ghost layer, no inline transform and no Web Animation.
// The V12 toast keeps its blur at rest (it is hidden) and is the one allowed exception
const stillness = (page) => page.evaluate(() => ({
  blur: [...document.querySelectorAll('body *')].filter((e) => !e.closest('.t-toast') && /blur/.test(getComputedStyle(e).filter)).map((e) => e.tagName + '.' + e.className),
  layers: document.querySelectorAll('.skull, .wisp, .intro_fx, .swap_fx, .mist_bank, .afterimage, #smoke').length,
  moved: [...document.querySelectorAll('[style*="transform"]')].map((e) => e.tagName + '.' + e.className),
  web: document.getAnimations().filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).length,
  blurring: document.getAnimations().filter((a) => !(a.effect.target && a.effect.target.closest('.t-toast')) && a.effect.getKeyframes().some((k) => /blur/.test(k.filter || ''))).length,
}));
const STILL = { blur: [], layers: 0, moved: [], web: 0, blurring: 0 };
const SPOTS = {
  customer: ['.beers', '.wines', '.spirits', '.kosher', '.ecologic', '.specials', '.all'],
  management: ['#specials_db', '#check_stock', '#shortage_alert', '#drinks_list'],
};
for (const [role, tabs] of Object.entries(SPOTS)) {
  test(`B8: ${role} under reduced motion: the intro, every flag and every tab switch leave no blur, layer, transform or Web Animation`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await login(page, role);
    expect(await stillness(page)).toEqual(STILL); // arrival and the first fill (G5, G3)
    for (const flag of ['#eng', '#sve', '#ita', '#esp', '#pirate']) await page.hover(flag, { timeout: 2000 }); // G1
    await page.keyboard.press('Tab');
    expect(await stillness(page)).toEqual(STILL);
    for (const tab of tabs) { // G4
      await page.click(tab);
      expect(await stillness(page), tab).toEqual(STILL);
      await page.waitForTimeout(300);
      expect(await stillness(page), tab + ' later').toEqual(STILL);
    }
  });
}

test('B8: the landing page and the bartender page under reduced motion leave no blur, layer, transform or Web Animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  for (const [, , open] of DIALOGS) { // G6, and G2's slips and G1's flags with them
    await open(page);
    await page.evaluate(() => document.querySelectorAll('#about, #passwords').forEach((e) => e.dispatchEvent(new PointerEvent('pointerenter')))); // G2: a wind that must not start
    await page.waitForTimeout(300);
    expect(await stillness(page)).toEqual(STILL);
    await page.reload();
  }
  await login(page, 'bartender');
  expect(await stillness(page)).toEqual(STILL);
});

// B9: accessibility with the ghost motion running (no-preference): axe in the busy moments, the virtual screen reader on clones, the keyboard on the flags
const gust = (page) => page.evaluate(() => document.querySelectorAll('#about, #passwords, .languages').forEach((e) => e.dispatchEvent(new PointerEvent('pointerenter')))); // a dialog's overlay blocks a real hover

test('B9: axe finds nothing on the landing page with the login, About or Passwords dialog open and the flags and slips in the wind', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [name, , open] of DIALOGS) {
    await page.goto('/index.html');
    await open(page);
    await gust(page);
    await page.waitForTimeout(1100); // the dialog has condensed (900 ms), the wind is blowing
    expect(await page.$$eval('.languages', (a) => a.filter((e) => e.style.transform).length), name).toBeGreaterThan(0);
    await axe(page);
  }
});

for (const [role, , tab] of LISTS) {
  test(`B9: ${role}: axe finds nothing during the skull, after it and in the middle of a tab switch`, async ({ page }) => {
    test.setTimeout(150000);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await enter(page, role);
    expect((await introState(page)).skull).toBe(1);
    await axe(page);
    await page.keyboard.press('Shift'); // ends the intro
    await page.evaluate(() => document.activeViewTransition && document.activeViewTransition.finished);
    await expect.poll(async () => (await introState(page)).intro).toBe(false);
    await page.click(tab);
    await page.evaluate(() => document.getAnimations().forEach((a) => a.pause())); // hold the swap at its first frame
    expect((await swapState(page)).clones).toBeGreaterThan(0);
    await axe(page);
  });

  test(`B9: ${role}: the first card is read at once while the skull is there`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await enter(page, role);
    expect((await introState(page)).skull).toBe(1);
    const name = await page.$eval('#drink_database > .drink', (c) => c.innerText.split('\n')[0].replace(/^Name:\s*/, '').trim());
    await startSR(page);
    const heardName = await page.evaluate(async (n) => { for (let i = 0; i < 400; i++) { await sr.next(); if ((await sr.lastSpokenPhrase()).includes(n)) return true; } return false; }, name);
    expect(heardName, name).toBe(true);
  });

  test(`B9: ${role}: a tab switch reads no clone, and the clones can neither be focused nor reached`, async ({ page }) => {
    await calm(page, role);
    await page.click(tab);
    await page.evaluate(() => document.getAnimations().forEach((a) => a.pause())); // the clones stay while the page is read
    const layer = await page.evaluate(() => ({
      hidden: document.querySelector('.swap_fx').getAttribute('aria-hidden'),
      inert: document.querySelector('.swap_fx').hasAttribute('inert'),
      clones: document.querySelectorAll('.swap_fx .drink').length,
      ids: document.querySelectorAll('.swap_fx [id]').length,
      focusable: document.querySelectorAll('.swap_fx :is(a, button, input, [tabindex]):not([disabled])').length,
    }));
    expect(layer).toMatchObject({ hidden: 'true', inert: true, ids: 0 });
    expect(layer.clones).toBeGreaterThan(0);
    await startSR(page);
    const during = await readAll(page);
    await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
    await expect.poll(async () => (await swapState(page)).layers).toBe(0);
    await page.evaluate(() => sr.stop && sr.stop());
    await startSR(page);
    expect(during).toEqual(await readAll(page)); // the same words with the clones gone
  });
}

test('B9: the login dialog and the About window read as before with the motion on', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await startSR(page);
  expect((await readAll(page)).some((p) => /User name/.test(p))).toBe(false); // closed, so not read
  await page.evaluate(() => sr.stop());
  await startSR(page);
  await tabTo(page, /Order your Drinks/);
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => sr.lastSpokenPhrase())).toMatch(/^textbox, User name/); // focus moves into the dialog at once
  await page.keyboard.press('Escape');
  await tabTo(page, /About this project/);
  await page.keyboard.press('Enter');
  expect(await tabTo(page, /Close/, 6)).toBe('button, Close');
});

test('B9: Tab through the flags: each focus starts the gust, the ring stays on the still link and the flag stays centred in it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, 'customer');
  await page.keyboard.press('Shift'); // keyboard use, so focus rings show
  await page.focus('#eng');
  for (const id of ['eng', 'sve', 'ita', 'esp', 'pirate']) {
    expect(await page.evaluate(() => document.activeElement.id)).toBe(id);
    await expect.poll(() => page.$eval(`#${id} .languages`, (e) => e.style.transform), { message: id + ' gust' }).not.toBe('');
    const at = () => page.$eval('#' + id, (a) => { const r = a.getBoundingClientRect(), f = a.firstElementChild.getBoundingClientRect(), c = getComputedStyle(a); return { box: [r.x, r.y, r.width, r.height].map(Math.round), still: a.style.transform == '', ring: a.matches(':focus-visible') && c.outlineStyle == 'solid' && c.outlineWidth == '3px' && c.boxShadow != 'none', inside: Math.abs(f.x + f.width / 2 - r.x - r.width / 2) < r.width / 4 && Math.abs(f.y + f.height / 2 - r.y - r.height / 2) < r.height / 2 }; });
    const first = await at();
    await page.waitForTimeout(500); // the flag keeps moving
    expect(await at()).toEqual({ ...first, ring: true, inside: true, still: true });
    expect(first).toMatchObject({ ring: true, inside: true, still: true });
    if (id != 'pirate') await page.keyboard.press('Tab');
  }
  await page.evaluate(() => document.activeElement.blur()); // off the last flag: the wind drops
  await page.waitForTimeout(3500);
  expect(await page.$$eval('footer .languages', (a) => a.map((e) => Math.abs(parseFloat(/rotate\(([-\d.]+)deg/.exec(e.style.transform)?.[1] || 0)) < 0.1))).toEqual([true, true, true, true, true]);
});

test('B9: Tab to the About and Passwords slips starts their wind, and the ring moves with the slip', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/index.html');
  await page.keyboard.press('Shift');
  for (const id of ['about', 'passwords']) {
    await page.focus('#' + id);
    await expect.poll(() => page.$eval('#' + id, (e) => e.style.transform), { message: id }).not.toBe('');
    expect(await page.$eval('#' + id, (e) => { const c = getComputedStyle(e); return e.matches(':focus-visible') && c.outlineStyle == 'solid' && c.outlineWidth == '3px' && c.boxShadow != 'none'; })).toBe(true);
  }
});
