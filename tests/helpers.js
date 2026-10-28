// Shared steps: log in, start the Guidepup virtual screen reader, read what it said, run axe.
const { expect } = require('@playwright/test');

const SR = '/node_modules/@guidepup/virtual-screen-reader/lib/esm/index.browser.js';

// Log in through the real form with the keyboard, the way a screen-reader user would
async function login(page, role, language = 0) {
  await page.goto('/index.html');
  await page.evaluate((i) => localStorage.setItem('index', i), language);
  await page.reload();
  await page.focus('#' + role);
  await page.keyboard.press('Enter');
  await page.fill('#user_name_input', 'test');
  await page.fill('#password_input', 'test');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/' + role + '.html');
}

async function startSR(page) {
  await page.evaluate(async (src) => {
    window.sr = (await import(src)).virtual;
    await sr.start({ container: document.body });
  }, SR);
}

// Everything spoken since the last call, then the log is cleared
async function heard(page) {
  await page.waitForTimeout(150); // announce() writes the live region after 50 ms
  return page.evaluate(async () => { const log = await sr.spokenPhraseLog(); await sr.clearSpokenPhraseLog(); return log; });
}

// Read the whole page top to bottom, like a screen reader's "read all"
async function readAll(page) {
  return page.evaluate(async () => {
    for (let i = 0; i < 5000 && (await sr.lastSpokenPhrase()) !== 'end of document'; i++) await sr.next();
    const log = await sr.spokenPhraseLog(); await sr.clearSpokenPhraseLog(); return log;
  });
}

// How many phrases match, to catch messages read twice
const count = (log, pattern) => log.filter((p) => pattern.test(p)).length;

// Tab until the virtual screen reader speaks a phrase that matches, like a user listening for a control
async function tabTo(page, pattern, max = 400) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const last = await page.evaluate(() => sr.lastSpokenPhrase());
    if (pattern.test(last)) return last;
  }
  throw new Error('Never reached ' + pattern);
}

// Same axe build and WCAG 2.2 AA tags as docs/audit-baseline.md
async function axe(page) {
  await page.addScriptTag({ path: require.resolve('axe-core') });
  const { violations } = await page.evaluate(() =>
    axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }));
  expect(violations.map((v) => v.id + ' (' + v.nodes.length + ')')).toEqual([]);
}

module.exports = { login, startSR, heard, readAll, count, tabTo, axe };
