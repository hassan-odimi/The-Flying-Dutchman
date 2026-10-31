# Fix plan F1–F13 (before V12 micro-motion and V13)

Source: `docs/issues/notes.md` and screenshots in `docs/issues/raw/` (Chrome, 1920×1080 desktop).
Status: **APPROVED by Hassan on 2026-10-30. Implementation not started.** Start with F1. Remaining review points: the SV/IT/ES/Pirate wording of new strings.

## Rules for the implementer (from the Phase 3 brief; every item must meet them)

- Branch `polish`. Commit only when Hassan asks. Never push unless asked. Never start step 6.
- Never commit raw files from `~/Downloads/Textures`. Bake textures with a script in `tools/textures/` (pattern: `gentex11.py`). Source files that are not used at runtime go in `tools/textures/src/`, because every file in `img/` must be referenced (the assets test fails otherwise).
- Colour tokens only in `:root` (`css/style.css`). No colour literals anywhere else.
- Motion: use the transitions-dev tokens already in `:root` (`--lift-in`, `--lift-out`, `--toast-*`). Every new transition or animation gets a `prefers-reduced-motion: reduce` guard with `!important` (project pattern, `css/style.css:716`).
- Every new visible label in all 5 languages (EN, SV, IT, ES, Pirate) in the matching `js/view/view_*.js` array, wired in that page's `translate()`.
- Contrast: measure on the worst pixel under the text with the text hidden (`tools/textures/contrast.js`). Body text 4.5:1, large text and icons 3:1.
- Targets: 24 px minimum; 44 px at phone width (≤ 768 px).
- No sideways scroll at 320 and 375 px. Check at 1280 and 1920 too.
- axe: 0 violations (`tests/helpers.js` `axe(page)`) on every touched page at 1280 and 375.
- Tests: `npx playwright test` must pass (Chromium and Firefox). The Firefox bartender docket test is known to flake under parallel load; it must pass when run alone.
- After each item: screenshots to `docs/visual-after/f<N>-<what>-<width>.png`, one line in `docs/audit-baseline.md`, and DESIGN.md updated if a pattern changed.
- Server: `python3 -m http.server 8080` (launch config `dutchman`). Logins: user `test`, password `test` for every role (see `tools/textures/screens.js`).

## Order

1. **Bugs first** (no design input): F1, F2, F3.
2. **Foundations** that everything else sits on: F4 font, F5 page layout and scrollbars, F6 buttons.
3. **Components**: F7 tabs, F8 drink cards, F9 toast and fog.
4. **Pages**: F10 About, F11 bartender queue, F12 management, F13 order confirmation.

---

## F1 Root URL shows "Access denied" — BUG

- Symptom: `http://localhost:8080/` redirects to `index.html` with the toast "Access denied. You were sent to your own page." (`Localhost.png`).
- Root cause: `js/login.js:64` takes the page name from the path. For `/` the name is `""`, so `checkAccess()` treats it as a foreign page. With no user type stored, `goToUserPage(null)` sends the user to `index.html` and queues the error toast.
- Fix: `js/login.js:64`, default the page name: `... .split(".")[0] || "index";`
- Test: new test in `tests/index.spec.js`: `page.goto('/')` with empty storage; expect URL to stay `/`, `#toast` not `.is-open`, `sessionStorage.toast` null.

## F2 "Update Orders" does nothing — BUG

- Symptom: the red Update Orders tab is lit on load and a click changes nothing (`04.png`).
- Root cause: `js/bartender.js:28-42`. The poll sets `NEWORDER` to `0` right after it lights the button. The click handler then checks `NEWORDER == 1`, which is never true. The poll also fires when `NEWORDER` is `null` (never set), so the button is lit on first load.
- Fix:
  - Poll: `if (localStorage.getItem("NEWORDER") == 1) { ...addClass("has-new"); setItem("NEWORDER", 0); }`
  - Click: `if ($(this).hasClass("has-new")) { removeClass; updateTransactions(); clearUndone(); clearDone(); }`
  - The idle look of the button is part of F7 (it is a tab-row button, not a tab).
- Test: `tests/bartender.spec.js`: set `localStorage.SESSION` with a new transaction and `NEWORDER=1`; wait for `.has-new`; click; expect the new order row; expect `.has-new` gone. Second test: fresh load, `.has-new` absent.

## F3 Small data and copy bugs — BUG

Found while tracing; not in the notes.
- a. Manager order rows show decimals: "SEK 15.7:-" (`07.png`). `js/management.js:306` and `:322` multiply `prisinklmoms` raw. Use `Math.round(this.prisinklmoms * number)`, like line 270 uses `parseInt`. Check the total in the order panel sums the rounded values.
- b. "payed" is wrong English (`03.png` toast). `js/view/view_customer.js:150` and `:154`: change to "paid". Check SV/IT/ES lines read naturally; change only EN and Pirate.
- c. Paid stamp reads "PAID by" with no name for orders the customer paid with credit (`04.png`, order #00021). `js/bartender.js:264`: when `getBartenderName(element.bartender_id)` is empty, print the word "credit" instead of "by …". New 5-language array `paid_credit` in `js/view/view_bartender.js`: "with credit", "med kredit", "con credito", "con crédito", "with yer credit".

---

## F4 Font — DECIDED: A, Pirata One + Alegreya Sans

- Note: "Font should be revised everywhere to match the theme."
- Today: 2 families from Google Fonts in every `*.html` `<head>`. Berkshire Swash for page titles and the greeting (6 rules). Oswald for everything else (9 rules). Type scale tokens `--text-*` and weights `--weight-*` in `css/style.css:91-98`.
- Mockup: `docs/visual-options/f4-font.png` (option A, top right).
- Implementation:
  - Replace the Google Fonts `<link>` in `index.html`, `customer.html`, `bartender.html`, `management.html` with `family=Pirata+One&family=Alegreya+Sans:wght@400;500;700&display=swap`.
  - Add to `:root`: `--font-display: 'Pirata One', serif;` and `--font-body: 'Alegreya Sans', sans-serif;`. Replace every `font-family:` literal in `css/*.css` with the token: Berkshire Swash rules use `--font-display`, Oswald rules use `--font-body`.
  - Pirata One has only weight 400: display rules keep `font-weight: var(--weight-body)` (no faux bold; see the comment at `css/style.css:127`, update it).
  - Alegreya Sans defaults to old-style numerals. Add `font-variant-numeric: lining-nums tabular-nums;` on `body` so prices and order numbers line up.
  - Alegreya Sans is wider than the condensed Oswald. Check every place that relied on Oswald's narrow width.
  - Re-check line heights and the fixed-height elements that hug Oswald's narrow width: tabs (`css/style.css:433`), order rows, toast, phone footer at 320 px (Spanish is the longest language).
  - Re-measure contrast on the paper surfaces; thinner strokes can drop below 4.5:1.

## F5 Page layout and scrollbars — DECIDED: layout A (full height, full width); scrollbar = rope coil on a mast

- Notes: "all page and the main section should be responsive", "scroll bars should be redesigned to match the theme", "There should be no scrolling bar to the tabs section" (`01.png`).
- Today:
  - Customer, management and bartender use floats and fixed heights. `.drink_list` is `height: 500px` (`css/customer.css:141`). The tab row `.menu` has `overflow: auto` (`css/customer.css:95`), which draws the second scrollbar beside the tabs. At 1920×1080 the panels fill half the screen; the rest is empty wood.
  - Bartender footer bar ends at the panel width, not the page (`04.png`).
  - Scrollbars are browser default (white track, grey thumb).
- Mockups: `docs/visual-options/f5-layout.png` (A, middle), `f5-scroll-3.png` (chosen scrollbar).
- Layout implementation:
  - Desktop (≥ 769 px) page shell as CSS grid on `body`: rows `auto auto minmax(0, 1fr) auto` (header, tab row, main, footer), `height: 100dvh`. No `max-width`. Main = list + order panel side by side.
  - Replace the floats and fixed heights: `.drink_list` `height: 500px` (`css/customer.css:141`), `.selection` `350px` (`:254`), `.selection_header` `75px`, `.main_section` `70%`; the same pattern in `css/management.css` and `css/bartender.css`. The order column becomes its own grid: header `auto`, list `minmax(0, 1fr)`, checkout `auto`.
  - Only the drink list and the order list scroll. Remove `overflow: auto` from `.menu` (`css/customer.css:95`) so the tab row never shows a scrollbar; tabs keep their width and the row wraps if it runs out of room.
  - Bartender: the footer bar spans the page width (today it ends at the panel, `04.png`).
  - Phone layout (≤ 768 px) keeps today's stacked layout; re-check 320 and 375 px for sideways scroll.
  - Guard: at heights under 600 px (landscape phones, 200% zoom) fall back to normal page scrolling, so the list never shrinks to nothing.
- Scrollbar implementation (rope coil on a mast):
  - New baked textures, script `tools/textures/gentex12.py` (pattern of `gentex11.py`; mockup recipe `docs/issues/recipes/mast_coil.py`):
    - `img/textures/mast.webp` 16×360: a vertical strip of Texturelabs Wood 131 with cylinder shading (light at 38% from the left).
    - `img/textures/coil.webp` 16×32: short straight pieces of the existing `img/textures/rope.webp`, tilted −14°, stacked every ~42% of the piece height with a 3 px dark shadow below each turn, cylinder-shaded. Tiles seamlessly in Y.
  - CSS in `css/style.css`, global:
    ```css
    ::-webkit-scrollbar { width: 16px; height: 16px; }
    ::-webkit-scrollbar-button { display: none; }
    ::-webkit-scrollbar-track { background: url("../img/textures/mast.webp") 0 0 / 16px auto repeat-y, var(--mast); }
    ::-webkit-scrollbar-thumb { background: url("../img/textures/coil.webp") 0 0 / 16px auto repeat-y, var(--rope); border-radius: 3px; box-shadow: var(--shadow-coil); }
    @supports not selector(::-webkit-scrollbar) { * { scrollbar-color: var(--rope) var(--mast); } }
    ```
    Tokens in `:root`: `--mast` (dark weathered wood, sample the texture average), `--rope` (sample the rope average), `--shadow-coil: 0 2px 3px` + `--shadow-lift`. Do not set `scrollbar-color` for Chromium: since Chrome 121 it switches off the `::-webkit-scrollbar` styles. The `@supports` guard limits it to Firefox.
  - Non-text contrast: thumb against track ≥ 3:1 (measure average rope vs. average mast); if short, lighten the rope tone in the bake.

## F6 Log Out, Undo/Redo and Close (X) buttons — DECIDED: A1, separate worn iron plates; tilted anchor icons; bolt-head X

- Mockups: `docs/visual-options/f6-buttons-2.png` (A1 plate and bolt X), `f6-buttons-3.png` (anchor A).
- New baked textures in `tools/textures/gentex12.py`:
  - `img/textures/plate-worn.webp` 360×96 RGBA. Face: Texturelabs Metal 155 crop (x 200–1400, y 700–1020), colour 0.45, tone-mapped `v → 28 + 0.42·v` so the face never exceeds sRGB ~135. Rim: Texturelabs Metal 132 rust multiplied by (150, 120, 110), blended in through a blurred (σ 9) rounded-rect mask 14 px in from the edge. Outline: a slightly wobbly polygon (±1.6 px) with 7 irregular chip clusters and 4 bitten corners, alpha blurred 0.7. Top bevel: 4 px light band (170, 165, 150) at 55/255. Seed 11 (recipe `docs/issues/recipes/plate.py`). Mockup bake measured white text 4.83:1 on the worst pixel of the face; re-measure after baking.
  - `img/textures/bolt.webp` 128×128 RGBA: Texturelabs Details 141 crop (512, 121, 1432, 1041), brightness 0.6, multiplied by Metal 132 rust, circular alpha.
  - `img/icons/anchor.webp` (or an SVG mask): from the reference `anchor.png` (rounded stock), 128×128 alpha only. Commit only the baked file, never the raw PNG.
- CSS:
  - One shared rule for `#logout`, `#logout_phone`, `#undo`, `#redo` (and the bartender and management equivalents): `background: url(plate-worn.webp) 0 0 / 100% 100% no-repeat`, no border, no border-radius, `filter: drop-shadow(...)` with `--shadow-lift` tokens (box-shadow would draw a rectangle around the chipped outline). White text with a 1 px dark text-shadow. Small fixed tilts: Log Out −0.6°, Redo +0.8°.
  - Hover: `filter: brightness(1.12)` on top of the drop shadow; press sinks 1 px (existing V4 pattern). Disabled (`.fade`): keep the 0.5 opacity.
  - Remove the white outline rule `#logout.red` (`css/style.css:495-502`).
  - Undo/Redo icon: replace the SVG `<use href="img/icons.svg#undo|redo">` with a `span.anchor` that has `background: currentColor; mask: url(anchor) center / contain no-repeat`. **Direction follows the old curved arrows**: Undo anchor tilted **+32°** (clockwise), Redo tilted **−32°**. Check against the arrow icons and match their visual direction.
  - **Words "Undo"/"Redo" visible at every width.** Delete the `@media (max-width: 1249px)` rule that hides `.undo_label` and `.redo_label` (`css/style.css:398-407`). At phone width shrink plate padding. Re-fit the footer at 320 px in Spanish ("Deshacer"/"Rehacer") with no sideways scroll; 44 px targets on phones.
  - Close X (`#close`, `.close_window`): 48×48 round, `background: url(bolt.webp) center / 100% 100%`, white X stroke 3 with a 1 px dark drop shadow. 44 px minimum on phones holds.
- Constraint: plates must stay visually quieter than the brass Place Order.

## F7 Tabs: hover and selected — DECIDED: idle notes dim; hover = clean paper; selected = warm-tinted note pulled forward with a rusty rivet tack

- Note: "The paper should get more saturated on hover, and the selection should match the paper theme but using the main colour" (`01.png`). Hassan then asked to swap: the warm tint marks the selected tab.
- Today: `css/style.css:430-465`. Paper notes (`tab-note1..3.webp`); hover only grows 2 px; selected switches to the grey-green board texture.
- Mockup: `docs/visual-options/f7-tabs-3.png` (K1).
- Implementation (`css/style.css`, TABS block; applies to every `.menu li button`, customer, bartender, management):
  - Idle: `filter: brightness(.82) saturate(.7) drop-shadow(0 2px 3px var(--shadow-lift))`. Re-measure sepia text on the dimmed paper: worst pixel must stay ≥ 4.5:1; if not, dim less (start at .88).
  - Hover: `filter: drop-shadow(0 3px 4px ...)` only (paper at full brightness), height 38 px, margin-top 2 px (existing lift), duration `--lift-in`.
  - Selected (`[aria-pressed="true"]`): keep its own torn note texture (do not switch to `board-surface.webp`); `filter: saturate(2.2) sepia(.25) brightness(.96) drop-shadow(0 4px 6px ...)`; height 46 px, margin-top −6 px, padding-top 12 px, no tilt, `color: var(--ink)`, weight 700 (Alegreya Sans), one size step up (`--text-md`), `z-index: 2`.
  - Tack: `::before`, 18×18, centred at top −3 px, `background: url("../img/textures/rivet.webp") center / 100% 100%`, round, drop shadow. Decorative only.
  - Phone dropdown (`.dropdown-content button[aria-pressed="true"]`, `css/customer.css:118`): same warm tint, no tack.
  - Reduced motion: no height transition.
  - Bartender: the tabs also lie on the card-table rail with torn bottoms (F11, Card table).
  - Bartender "Update Orders" (F2) is a button in the tab row, not a tab: use the F6 worn iron plate; `.has-new` state = the existing alert red (`--alert-fill`) with white text plus a small red wax seal (F9 asset) at the corner. Keep the `.has-new` text change for screen readers if one exists; else add a visually hidden "new orders" label in 5 languages.

## F8 Drink cards, hover, stock stamps, list background — DECIDED: paper label cards (A); stamps; list background M2

- Note: "cards need texture, the hover should be improved, low stock can be an old stamp" (`02.png`). Background behind the cards: "a mixture of L2 and L3 … stronger texture".
- Mockups: `docs/visual-options/f8-cards.png` (A) and `f8-list-2.png` (M2).
- Implementation (`css/customer.css`, `.drink` block from line 170; the same card class is used by management, check `css/management.css`):
  - Card: `background: url("../img/textures/paper-list.webp") 0 0 / 100% 100%, var(--paper)`; `color: var(--ink-sepia)`; shadow `0 2px 4px` + `0 6px 12px` with `--shadow-lift`. Re-measure sepia on the darkest paper pixel (≥ 4.5:1).
  - Hover: `translateY(calc(-1 * var(--lift-distance))) rotate(-0.8deg)`, deeper shadow (`--shadow-float`), `filter: saturate(1.4) sepia(.12)` (paper warms). Timing `--lift-in` / `--lift-out`. Keyboard focus gets the same lift plus the existing focus ring. Reduced motion: no transform.
  - LOW STOCK stamp (`.stock.low_stock`, emitted at `js/customer.js:250`): no fill; `color: var(--flag-red)`; `border: 3px double currentColor`; radius 3 px; uppercase, letter-spacing .1em, weight 700, 13 px; `rotate: -7deg`; worn by `mask: url("../img/textures/stamp-wear.webp") center / 160px auto` (pattern from `css/bartender.css:149`). Must still read 4.5:1 against the paper (measure with the mask applied).
  - OUT OF STOCK stamp (`.stock.out_stock`, `js/customer.js:254`): same stamp in near-black ink (new token `--ink-stamp`), 20 px, border 4 px, placed across the greyed bottle: `.drink { position: relative }`, stamp `position: absolute; left: 50%; top: 46%; translate: -50% -50%; rotate: -20deg; white-space: nowrap`.
  - The stamp text is already real text: screen readers keep reading "Low stock" / "Out of stock". Labels are already in 5 languages (`low_stock`, `out_stock`).
  - List background (`.drink_list`, and the management list): `background: url(rust.webp) 0 0 / 400px 200px, url(tarnish.webp) 0 0 / 300px 150px, url(board-kelp.webp) 0 0 / 512px 94px, var(--control-strong); background-blend-mode: multiply, multiply, normal, normal; box-shadow: inset 0 0 50px <token>, var(--shadow-raised)`. Add the inset shadow colour as a token.
  - Remove the old pill styles (`css/customer.css:206-218`).
  - Torn, varied paper (decided with F12): customer cards use the same 4 baked paper variants as the management rows, in portrait versions `img/textures/card-paper1..4.webp` (about 400×600), assigned by `:nth-child(4n+…)`, alpha edges with `filter: drop-shadow`.

## F9 Toast: fog, message layout, icons — DECIDED: fog A (low sea mist, feathered, drifting); layout T1 (title + detail); icons = wax seals (Hassan's photo #10)

- Notes: "icons used in the toasts should match the theme", "the fog effect is so bad … improve visually and introduce animation", "improve the readability and format of the message".
- Root cause of the bad fog: `img/textures/mist.webp` (560×240) has hard alpha edges (alpha 50 at the left edge, 255 along the bottom); `css/style.css:676` stretches it into a 760×240 box, so a visible rectangle sits on the page.
- Mockups: `docs/visual-options/f9-fog.png` (A), `f9-toast-2.png` (layout T1).
- Fog:
  - Re-bake `img/textures/mist.webp` in `gentex12.py`: Texturelabs Atmosphere 142 crop (0, 1300, 4240, 3121) → 1400×300 greyscale; crossfade the last 200 px over the first 200 px so it tiles in X; curve `a = min(255, 1.5·255·(v/255)^0.9)`; white RGB with that alpha. Delete the stretch.
  - CSS: `.toast_wrap { isolation: isolate }`. Two layers `::before` and `::after`, `z-index: -1` (behind the note), `left: 50%; translate: -50% 0; bottom: -70px; width: min(1000px, 150vw); height: 300px` (second layer: bottom −90 px, height 220 px, opacity .75); `background: url(mist.webp) 0 0 / auto 100% repeat-x`; feather with `mask: radial-gradient(closest-side, #000 35%, transparent)`.
  - Animation: while open, `@keyframes mist-drift { to { background-position-x: <tile width> } }`; layer 1 40 s linear infinite, layer 2 reverse 55 s. Fade in/out with the existing toast tokens. Reduced motion: no drift (`animation: none !important`).
  - The mist must never cover the note text (z-index) and must not catch clicks.
- Message layout T1:
  - Markup: `.toast_text` holds `<b class="toast_title">` and `<span class="toast_detail">`, CSS `display: grid; gap: 2px`. Title 20 px weight 800 (Alegreya Sans), detail 16 px, line height 1.35, `color: var(--ink-sepia)`, no blurred text-shadow (delete `text-shadow: 0 0 1px …` at `css/style.css:627`). Note max-width 460 px, padding 18 16 6.
  - `showToast(message, isError)` in `js/login.js:96` gets a title: `showToast(title, detail, isError)`. Update every caller (8 messages) and `toastAfterLoad`. The live region announces "title. detail".
  - New 5-language title arrays (EN / SV / IT / ES / Pirate), in the view file next to each message:
    | message | EN title |
    |---|---|
    | `message_payed_order` | Order paid |
    | `message_placed_order` (customer, management) | Order placed |
    | `message_empty_order` | Nothing to order |
    | `msg_access_denied` | Access denied |
    | `msg_wrong_username` / `msg_wrong_password` | Login failed |
    | `message_delete_order` (bartender) | Order removed |
    | `message_mark_paid` (bartender) | Marked as paid |
    Shorten the detail lines where they repeat the title. Hassan reviews the SV/IT/ES/Pirate wording.
- Icons: wax seals, 44 px, green = done, red = error; red error ribbon stays (move it to a new element, since `::before` now holds the seal). **Asset decided:** Hassan's photo `paolo-chiabrando-21VlmPMZEtw-unsplash.jpg` (#10), cut out and sharpened; Pixabay had no better real photo. Bake: cut out by colour (redness), fill holes, close edges, square 160 px, sharpen the imprint (unsharp mask), recolour to green by hue shift; output `img/textures/seal-red.webp` and `seal-green.webp`. Mockup bake script: `docs/issues/recipes/seal.py`.

## F10 About dialog — DECIDED: A, three columns, rewritten copy, few icons, textured

- Note: "should fit without scrolling, improve scan/glance" (`About.png`). Hassan: "do not overuse icons, enhance their look with a better texture".
- Today: `#about_window` is `height: 500px` with an inner `.scrollable` of `400px` (`css/index.css:203-240`). Copy is outdated ("green tab", "dragging the pirate flag to the ship"). English only.
- Mockup: `docs/visual-options/f10-about.png` (A). The mockup's anchor bullet on every line is too much: see below.
- Implementation (`index.html:66-93`, `css/index.css:203-240`):
  - Sheet `width: min(920px, 92vw)`, `height: auto`, centred, padding 36 32 24. Delete `.scrollable` and its fixed 400 px; at phone width the dialog itself may scroll (`max-height: 90dvh; overflow: auto`).
  - Title in `--font-display` 40 px; lede 19 px, max 60ch, centred.
  - Body: grid of 3 columns (1.4fr 1fr 1fr) with ruled top and bottom lines (`--rule-sepia`); one column below 769 px.
  - Each column heading in `--font-display` 26 px with **one** small textured icon before it (24 px): Try it = anchor, Built with = ship's wheel (reference `rudder.png`), Crew = the pirate flag skull from `flag-pirate.webp` or a tricorn. Icons are baked as brass or iron: the silhouette is filled with the Metal 132/155 texture plus a 1 px bevel, not flat colour (bake in `gentex12.py`). List bullets are plain small sepia dashes, no icons.
  - Copy (EN), 5 languages via a new `about_*` array set in `js/view/view_index.js`, wired in `js/index.js` `translate()`:
    - Lede: "A bar ordering system, built in 2018 for User Interface Programming I at Uppsala University. Plain HTML, CSS and jQuery, no framework."
    - Try it: "Open Get the passwords and pick a role." / "Order as a customer, serve as a bartender, restock as a manager." / "Every action can be undone." / "Change language with the flags." / "Drop the pirate flag on the ship."
    - Built with: "HTML, CSS, jQuery" / "Undo and redo" / "Drag and drop" / "5 languages" / "Works on phones".
    - Crew: the 5 names (not translated).
    - Footer: "Source code:" + repo link (opens in a new tab; add `rel="noopener"`).
    - Hassan reviews the SV/IT/ES/Pirate wording before commit.
  - Close = F6 bolt head. Check: no scroll at 1280×800 and 1920×1080 in all 5 languages; axe 0; 320 px no sideways scroll.

## F11 Bartender orders queue — DECIDED: 1850 playing-card dockets in solitaire piles, opened in place

- Note: "the layout, style, stamps, hover and everything should be revised for better scan/glance" (`04–06.png`). Hassan: dockets "inspired by vintage playing cards … stacked (less detail, optimised for scanning) … pulled to open the order details as a full card"; remove "SEK" (the `:-` already says kronor); open in place, with the trade-off reduced.
- Mockups: `docs/visual-options/f11-cards.png` (assets, V1, V2) and `f11-cards-2.png` (final band layout and in-place open).
- Assets (public domain): Wikimedia Commons "French Portrait card deck - 1850", BnF Gallica `btv1b10527601s`, engraver Nicolas-Marie Gatteaux. Raw scans are in `~/Downloads/Textures/French_Portrait_card_deck_-_1850_-_{Back,Ace_of_Hearts,Ace_of_Diamonds,Ace_of_Spades,Ace_of_Clubs}.jpg` (never commit). Bake in `gentex12.py` (mockup recipe `docs/issues/recipes/cards.py`):
  - `img/textures/card-face.webp` 600×900: the clean lower part of the Ace of Hearts (with its faint watermark), mirrored to fill.
  - `img/textures/pip-heart.webp`, `pip-spade.webp` 128×128 RGBA, cut by ink threshold from the aces, keeping the scan's ink colour. (Diamond and club are optional; the club needs its wreath removed.)
  - `img/textures/tax-stamp.webp`: the blue "République Française" stamp from the Ace of Clubs, alpha from blue minus red.
  - Credit the BnF in `docs/ASSETS.md`.
- Markup (`js/bartender.js` `printToDOM`, lines 178–212): keep one `button.accordion` per order (so the existing click, keyboard and `aria-expanded` logic keep working) but restyle it as a card, `.pc.open` or `.pc.paid`:
  - Corner index top-left: order number (`--font-display`, 26 px; red ink token for not paid, near-black for paid) over a pip (heart = not paid, spade = paid). Mirrored index bottom-right (rotate 180°), hidden while open. Indices are `aria-hidden`; the number is in the accessible name.
  - Band (2×2 grid): row 1 = customer name (17 px, 800, ellipsis) | total `495:-` (19 px, 800, right-aligned, tabular); row 2 = time (14 px, muted sepia) | state stamp (right).
  - Stamps: not paid = today's worn red stamp; paid = today's kelp "PAID by …" stamp (or "with credit", F3c), both `width: max-content`, 11–12 px uppercase. Paid cards also carry the blue tax stamp at 35% opacity as decoration (`::after`, behind text). Large centre pip on the visible bottom card of each pile only.
  - Remove the word "SEK" from the card and the opened docket (keep it in screen-reader text: "Total 495 kronor").
- Layout: `#all_orders` = flex row of piles, wrap. "Waiting" piles (unpaid, 5 cards each, newest first) then one "Paid" pile (most recent 6; older paid stay reachable under the Paid tab). Pile headings in `--font-display` 24 px on the panel. Card 244×330, radius 12, inner engraved frame (1 px inset line), drop shadow; cards in a pile overlap so each shows a 72 px band (`.pc + .pc { margin-top: -258px }`); tiny alternating tilt (±0.5°).
  - Tabs: All = waiting piles + paid pile; Unpaid = waiting piles only; Paid = paid piles (5 per pile).
  - Hover/focus: card lifts 14 px and its shadow deepens (`--lift-in`), so the band you point at stands out. Reduced motion: no lift, outline only.
- Open in place (reduces the jump): the opened card grows to 284 px wide and auto height (min 330) **on top of the cards below it in the same pile** (`position: relative; z-index: 5`), so the pile keeps its height and nothing else moves. The docket shows the order lines (list max-height 190 px, scrolls inside), total, and Cancel / Mark as paid (paid: "Paid by …"). One open card per pile; opening another card in the same pile closes the first. Esc closes and returns focus to the card. Grow and shrink with transitions-dev panel-reveal timing (`--lift-in` open, `--lift-out` close), reduced-motion = instant.
- Phones (≤ 768 px): one pile per row, full width cards, band layout unchanged; open card expands the pile (there is no room to overlay).
- Card table (DECIDED: A green baize + T2 tabs laid on the rail + B1 torn bottom). Hassan: the order panel should look like a playing-card table, and the paper tabs must not look disconnected from it. Mockups: `docs/visual-options/f11-table.png` (A), `f11-table-tabs.png` (T2), `f11-table-tabs-2.png` (B1). Recipe: `docs/issues/recipes/table.py`.
  - Assets (bake in `gentex12.py`): `img/textures/felt-green.webp` 512×512 seamless (ambientCG Fabric 034, CC0, tinted `#0b2a1c..#2f6a4c`, 25 % Atmosphere 133 wear stains); `img/textures/tab-bottom1..3.webp` 920×80 alpha masks (each wide note's own torn top, flipped and mirrored). Source felt is `~/Downloads/Textures/ambientCG_Fabric034_1K-JPG_Color.jpg` (never commit). Credit ambientCG (CC0) in `docs/ASSETS.md`.
  - Tokens in `:root`: `--felt: url("../img/textures/felt-green.webp") 0 0 / 512px;` `--felt-vignette: rgba(0, 0, 0, 0.45);` `--shadow-contact: rgba(0, 0, 0, 0.85);`.
  - Table (`css/bartender.css`, `.order_list`, replaces `background-color: var(--control-strong)` and `--shadow-raised`): the border is the wooden rail, the padding box is the felt.
    ```css
    border: 14px solid transparent;
    border-radius: 18px;
    background: radial-gradient(ellipse at 50% 35%, transparent 40%, var(--felt-vignette)) padding-box,
                var(--felt) padding-box,
                var(--wood) border-box;
    box-shadow: inset 0 0 70px var(--felt-vignette), var(--shadow-raised);
    padding-top: 34px; /* room for the tabs that lie on the rail */
    ```
    (`--wood` already carries its scrim, so the rail reads darker than the page wood. Drop the old `float`, fixed `height` and `overflow` per F5.)
  - Pile headings (white, `--font-display`) measured 9.46:1 on the brightest felt pixel with the text hidden. Re-measure after the real bake.
  - Tabs laid on the rail (T2), bartender page only: `.menu { position: relative; z-index: 3; margin-bottom: -24px; overflow: visible; }`; tabs 50 px high, the selected tab 58 px with margin-top −8 px (F7 rules otherwise unchanged). F5 already removes the float and `overflow: hidden` on `.menu`.
  - Torn bottom (B1): paper tabs only (not the `#retrieve_orders` plate): `mask: url("../img/textures/tab-bottom1.webp") 0 0 / 100% 100%;` with `tab-bottom2`/`3` on `li:nth-child(3n+2)`/`(3n)` (same cycle as the notes). A mask clips `filter: drop-shadow`, so the paper tabs drop it and the shadow moves to the `li`: `.menu li { position: relative; } .menu li::after { content: ""; position: absolute; left: 2%; right: 2%; bottom: -14px; height: 20px; border-radius: 40%; background: var(--shadow-contact); filter: blur(4px); z-index: -1; }`; selected (`li:has([aria-pressed="true"])::after`): bottom −18 px, height 24 px. The plate keeps its own drop-shadow.
  - Phones: same felt and rail (rail 10 px); tabs are the dropdown there, so no tab overlap.
- Tests: update `tests/bartender.spec.js` selectors; keep the docket test; axe 0; the virtual screen reader reads "Order 20, Zuleika Gorecki, 23:48, total 50 kronor, not paid, collapsed".

## F12 Management page and "Your Order" panel — DECIDED: A, compact paper rows with torn, imperfect edges in several variants; paper ledger

- Note: "layout, look and interactions should be improved. The Your Order section needs to be redesigned" (`07.png`). Hassan: "a bit of torn and imperfection … a few versions so it is not repetitive".
- Mockup: `docs/visual-options/f12-management.png` (A).
- Implementation (`css/management.css:95-145`, markup `js/management.js:255-290`):
  - Row `grid-template-columns: 90px 1fr 140px 300px`; bottle 110 px high; specs `.c2 { columns: 2; column-gap: 24px }` at 15 px; Add +1/+10/+100 in one row (`.c4 { flex-direction: row }`); stock number 40 px.
  - Paper: bake 4 row textures in `gentex12.py`, `img/textures/row-paper1..4.webp` (Paper 328, about 1200×200), each with a different torn edge (one long side torn, one corner nicked, one edge with a small tear, one with a worn fold) and light stains. Alpha edges, so use `filter: drop-shadow` not `box-shadow`. Assign with `.drink:nth-child(4n+1..4)`, plus a small alternating tilt (±0.3°).
  - Sepia text on the darkest pixel ≥ 4.5:1.
  - Your Order: reuse the customer ledger (T7). Move the shared `#drink_selection .order` rules from `css/customer.css:270-360` to `css/style.css` and make `js/management.js` `addOrder()` (lines ~300-330) emit the same row markup as `js/customer.js` (quantity, bottle, name, price, remove). Remove `.textRed` quantity.
  - Applies to all three management tabs (Full Drinks List, Check Bar Stock, Specials, Shortage Alert).

## F13 Order confirmation — DECIDED: A, receipt slip with an imperfect, worn ORDERED stamp

- Note: "the order confirmation should be improved" (`08.png`). Hassan: "make the stamp a bit imperfect and worn".
- Mockup: `docs/visual-options/f13-confirm.png` (A).
- Implementation (`js/management.js:180-190`, the Place Stock Order handler):
  - Before clearing the order, build a receipt in `#drink_selection`: head "Stock order #NNNN" + date and time; one line per item (name × qty, price); total; note "Delivery is booked with each supplier."; button "Start a new order" (returns focus to the list). Running number from `localStorage` (`STOCK_ORDER_NO`).
  - Paper: `paper-list.webp` with a zig-zag torn bottom (`clip-path`) and drop shadow.
  - ORDERED stamp: green ink (`--flag-green`), double border, uppercase, rotate −12°, worn by `stamp-wear.webp` at a different scale and offset from other stamps; imperfect: uneven pressure (add a second mask layer, linear-gradient 100% → 70% ink across the stamp), a faint offset double strike (`text-shadow: 1px 1px 0` at 30%), slightly rough border (`border-image` from a baked worn frame, or `filter: url(#rough)` SVG turbulence with a reduced-motion-safe static filter).
  - The receipt replaces the empty ledger until the first new Add; Undo after placing an order is not possible (state as today).
  - All new strings in 5 languages in `js/view/view_management.js`.
  - Live region announces "Order placed. Stock order NNNN, total SEK X."
  - The toast (F9 layout) still shows "Order placed".

---

## Appendix A: new baked assets (all in `tools/textures/gentex12.py`, sources stay in `~/Downloads/Textures`)

| Output in `img/` | Source | Used by | Recipe |
|---|---|---|---|
| `textures/mast.webp`, `textures/coil.webp` | Wood 131; existing `rope.webp` | F5 scrollbar | `recipes/mast_coil.py` |
| `textures/plate-worn.webp` | Metal 155 + Metal 132 | F6 buttons, F7 Update Orders | `recipes/plate.py` |
| `textures/bolt.webp` | Details 141 + Metal 132 | F6 Close X | F6 section |
| `icons/anchor.webp` (alpha) | `anchor.png` | F6 Undo/Redo | F6 section |
| `textures/mist.webp` (re-bake) | Atmosphere 142 | F9 fog | `recipes/fog.py` (mistA) |
| `textures/seal-red.webp`, `seal-green.webp` | `paolo-chiabrando-21VlmPMZEtw-unsplash.jpg` | F9 toast icons, F7 new-order mark | `recipes/seal.py` + sharpen |
| `textures/row-paper1..4.webp`, `card-paper1..4.webp` | Paper 328 | F12 rows, F8 cards | F12 section |
| `icons/about-*.webp` (3) | anchor, rudder, pirate flag + Metal texture | F10 headings | F10 section |
| `textures/card-face.webp`, `pip-heart.webp`, `pip-spade.webp`, `tax-stamp.webp` | BnF 1850 deck (PD) | F11 cards | `recipes/cards.py` |
| `textures/felt-green.webp`, `textures/tab-bottom1..3.webp` | ambientCG Fabric 034 (CC0) + Atmosphere 133; existing `tab-note-wide1..3.webp` | F11 card table, bartender tabs | `recipes/table.py` |

Every new file must be referenced (the assets test fails on unused files). Add each source, licence and credit to `docs/ASSETS.md`. Unsplash photos: Unsplash licence; Texturelabs: their free licence (already listed); BnF scans: public domain.

## Appendix B: how to run this plan (for the implementing model)

1. Work in the order of the **Order** section. One item = one focused change set. Do not start an item until the one before it passes its checks.
2. For each item: read the files named in it first; make the change; run `npx playwright test` (both browsers); run axe at 1280 and 375 on the touched pages; check no sideways scroll at 320 and 375; measure contrast where the item says so; save `docs/visual-after/f<N>-*.png` at 1280 and 375; add one line to `docs/audit-baseline.md`.
3. Mockup CSS in `docs/visual-options/` screenshots came from injected `!important` rules. Do not copy `!important` into the real CSS (only the reduced-motion guards use it). Write the real rules in the right file at the right place.
4. Colours: add any new colour as a token in `:root` first (`css/style.css`), then use it. No literals.
5. Copy: every new visible string in 5 languages; ask Hassan to review the translations before the commit.
6. If a decision in this plan turns out impossible or conflicts with a rule (contrast, target size, axe), stop and ask Hassan with 2–3 options; do not improvise a new design.
7. Never commit. Hassan asks for commits.
