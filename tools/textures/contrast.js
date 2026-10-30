// Hide text, screenshot its box, print path; PIL computes worst ratio
const { chromium } = require(process.cwd() + '/node_modules/@playwright/test');
const O = require(process.argv[3] || './options.js'), B = 'http://localhost:8080', CX = process.argv[2];
let n = 0; const out = [];
async function shot(page, sel, tag, ink) {
  const box = await page.evaluate((sel) => { const e = document.querySelector(sel); const r = document.createRange(); r.selectNodeContents(e); let b = r.getBoundingClientRect(); if (e.tagName === "INPUT") { const q = e.getBoundingClientRect(); e.style.setProperty("color", "transparent", "important"); return { x: q.x + q.width * 0.3, y: q.y + q.height * 0.25, width: q.width * 0.4, height: q.height * 0.5 }; } if (b.width < 10 || b.height < 10) { const q = e.getBoundingClientRect(); b = { x: q.x + 16, y: q.y + 30, width: 36, height: q.height - 56 }; return (e.style.setProperty("color", "transparent", "important"), b); } e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); return { x: b.x + 2, y: b.y + 3, width: b.width - 4, height: b.height - 6 }; }, sel);
  if (!(box.width > 0 && box.height > 0)) { console.log("bad", sel, tag, JSON.stringify(box)); return; }
  const f = `${CX}/${tag}-${++n}.png`; await page.screenshot({ path: f, clip: box });
  await page.evaluate((sel) => { const e = document.querySelector(sel); e.style.color = ''; e.style.textShadow = ''; }, sel);
  out.push([tag, ink, f]);
}
const inject = (page, css) => page.evaluate((css) => { let s = document.getElementById('v4'); if (!s) { s = document.createElement('style'); s.id = 'v4'; document.head.append(s); } s.textContent = css; }, css);
async function login(page, role) {
  await page.goto(B + '/index.html'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('index', 0); }); await page.reload();
  await page.evaluate((id) => document.getElementById(id).click(), role);
  await page.fill('#user_name_input', 'test'); await page.fill('#password_input', 'test'); await page.keyboard.press('Enter'); await page.waitForURL('**/' + role + '.html'); await page.waitForTimeout(1500);
}
(async () => {
  const br = await chromium.launch(); const page = await br.newPage({ viewport: { width: 1280, height: 800 } });
  const sepia = '2a1709', white = 'ffffff';
  await login(page, 'customer');
  for (const [k, css] of Object.entries(O.tabs)) { await inject(page, css); await page.mouse.move(0, 600); await page.waitForTimeout(400);
    for (const id of await page.$$eval('.menu li button:not([aria-pressed="true"])', (l) => l.map((b) => b.id))) await shot(page, '#' + id, 'tab-' + k, sepia); }
  await inject(page, O.buttons.Metal); await page.locator('#drink_database .drink').first().click(); await page.waitForTimeout(300); await shot(page, '#pay.small_button', 'brass-order', white);
  await login(page, 'bartender'); await page.evaluate(() => document.body.classList.add('bart'));
  for (const [k, css] of Object.entries(O.tabs)) { await inject(page, css); await page.mouse.move(0, 600); await page.waitForTimeout(400);
    for (const id of await page.$$eval('.menu li button:not([aria-pressed="true"]):not(.has-new):not(#retrieve_orders)', (l) => l.map((b) => b.id))) await shot(page, '#' + id, 'btab-' + k, sepia); }
  await page.goto(B + '/index.html'); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('index', 0); }); await page.reload(); await page.waitForTimeout(600);
  for (const [k, css] of Object.entries(O.side)) { await inject(page, css); await page.mouse.move(0, 600); await page.waitForTimeout(400); await shot(page, '#about', 'slip-' + k, sepia); await shot(page, '#passwords', 'slip-' + k, sepia); }
  await inject(page, O.buttons.Metal); await page.evaluate(() => document.getElementById('customer').click()); await page.waitForTimeout(600); await shot(page, '#login', 'brass-login', white);
  require('fs').writeFileSync(CX + '/list.json', JSON.stringify(out)); await br.close();
})();
