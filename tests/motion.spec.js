// V12 micro-motion tests (docs/motion-sound-plan.md)
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { login, startSR, heard, count, axe } = require('./helpers');

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

test('S6: a flag press swings its cloth 500 ms about the cord', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await login(page, 'customer');
  await page.click('#sve');
  expect(await anims(page, '#sve .languages')).toEqual([{ name: 'swing', dur: 500, delay: 0, ease: SETTLE }]);
  expect(await anims(page, '#eng .languages')).toEqual([]);
  await page.waitForTimeout(600);
  await page.click('#sve'); // pressed again: the swing restarts
  expect(await page.$eval('#sve .languages', (e) => e.getAnimations().filter((a) => a.animationName == 'swing')[0].currentTime)).toBeLessThan(300);
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
