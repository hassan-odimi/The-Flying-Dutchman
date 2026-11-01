# V12 micro-motion and the sound-cue layer: plan

Status 2026-11-01: plan ready to build. No app code is changed and nothing is committed. Hassan decided D1 to D6 (section 4). A new session builds it from section 5 (build guide), step by step, S1 to S9, with the sound pairing audition (5b) before any sound is wired in.

Demos: `docs/visual-options/v12-motion.html` (animated options for D1, D2, D5, D6, with a reduced-motion switch) and `docs/visual-options/v12-sound.html` (playable synthesized sounds for D3 and D4). Open them from the file system or any local server; they read the real textures in `img/textures/`.

## The principle

Every movement and sound is what the object on screen would do in an 1850s tavern. The UI is already made of materials (playing cards on baize, torn paper, brass and iron plates, wax and ink stamps, rope, cloth flags, coins), so motion follows their weight: a quick start, a short settle with a slight overshoot, no cartoon bounce, no glow. An effect with no real counterpart gets nothing. Sounds are foley, short and dry, never musical.

## 1. What moves today (audit)

All values read from the code on 2026-11-01. Project motion tokens (`:root` in `css/style.css`): `--toast-open` 350 ms, `--toast-close` 250 ms, `--toast-distance` 16 px, `--toast-blur` 2 px, `--toast-scale` 0.97, `--toast-ease` cubic-bezier(0.22, 1, 0.36, 1); `--shake-distance` 6 px, `--shake-overshoot` 4 px, `--shake-dur-a` 80 ms, `--shake-dur-b` 60 ms, `--shake-ease` (same curve), `--revert-dur` 280 ms; `--lift-distance` 2 px, `--lift-in` 150 ms, `--lift-out` 250 ms. These match the transitions-dev recipes (toast, error shake) and its shared scale (150 quick, 250 fast, 350 medium).

| What | Where | Motion | Tokens | Reduced motion |
|---|---|---|---|---|
| Toast note | all pages, `style.css` `.t-toast` | rises 16 px, scale 0.97 to 1, blur 2 to 0 px; 350 in, 250 out | `--toast-*` | no transition |
| Sea mist behind the toast | `style.css` `.toast_wrap::before/::after` | background drifts, 40 s and 55 s loops, while the toast is open | none (ambient) | no drift |
| Login error shake | `index.css` `.t-input` | 4-step shake, 280 ms in all | `--shake-*` | none |
| Login field border and error message | `index.css:542-560` | border colour 150 ms, message fade 280 ms | **literal `150ms ease-out`, `ease-out` and `280ms` fallbacks** | not guarded (colour and opacity only, so allowed) |
| Drink card hover | `customer.css:183-197` | lifts 2 px, tilts -0.8 deg, paper warms; 150 in, 250 out | `--lift-*`, `--toast-ease` | none |
| Paper tabs | `style.css:511-531` | height 36 to 38 px on hover, selected tab 46 px | `--lift-*` | none |
| Plates (brass, rust, iron) | `style.css:558-618` | press sinks 1 px, darkens; 150 ms | `--lift-in` | no sink |
| Order row remove | `style.css:814-825` | brush strike drawn left to right, bottle fades | `--toast-open/close` | none |
| About and Passwords slips | `index.css:191-203` | straighten and drop 4 px | `--lift-*` | none |
| Ghost-ship easter egg | `index.css:32-49` | 250 ms crossfade | `--lift-out` | none |
| Bartender card | `bartender.css:160-183` | hover lifts 14 px; open grows 244 to 284 px | `--lift-*` | outline, no lift |
| Bartender docket | `bartender.css:280-282` | grid row 0fr to 1fr; **open 150 ms, close 250 ms** | `--lift-*` | none |

The two values outside the token scale (the 2026-10 audit named two others, the bartender `transition: 0.4s` and the index `appear` keyframes; both were removed in F11 and V7):

1. **Login field and message** (`index.css:542-560`): `150ms ease-out` is written as a literal, and `var(--revert-dur, 280ms) ease-out` carries a literal fallback. Fix: `var(--lift-in) var(--toast-ease)` for the border and `var(--revert-dur) var(--toast-ease)` for the message, no fallbacks. Same timing, on the tokens.
2. **Docket open and close** (`bartender.css:280-282`, also the card's width and margin at `:160` and `:183`): the open is faster (150 ms) than the close (250 ms). That is the wrong way round, and transitions-polish says an accordion is one reversible motion: 250 ms both ways. Fix: drop the `transition-duration: var(--lift-in)` on `.pc:has(> .accordion.active)` and on `.accordion.active + .panel`, so both directions run `--lift-out` (250 ms). The hover lift keeps its quick-in, slow-out pair, which is right for hover.

Two accessibility findings the audit turned up:

- **WCAG 2.2.2, the mist.** A toast stays 4 s + 60 ms per character. Measured with the real strings: "Order paid" 8.26 to 8.68 s, "Order placed" 7.72 to 8.44 s, "Nothing to order" 7.24 to 7.72 s across the 5 languages. The mist moves for that long, longer than 5 s, next to other content, and only a mouse hover pauses it. Decorative motion counts. Decision D6.
- **WCAG 4.1.3, the bartender's new orders.** `checkOnOrders()` (`bartender.js:29`) turns Update Orders red and adds the hidden "(new orders)" label, but announces nothing. A screen-reader user is not told. A new-order bell must never be the only signal, so step S2 adds one `announce()` of the existing `new_orders_label` text when `has-new` is set (once per batch, not every 2 s poll).

## 2. Motion: the event table

Durations are the existing tokens. One new token: `--settle-ease: cubic-bezier(0.34, 1.36, 0.64, 1)`. No current token overshoots (`--toast-ease` peaks at exactly 1.0), and a thing that lands needs a small one. This is the transitions-dev `--ease-bounce` value, so it is on the shared scale. Measured: it overshoots 4.3 % at 64 % of the time, so a 16 px fall overshoots by 0.7 px and a 1.12 stamp scale dips to 0.995. That reads as weight, not bounce. It is used only on entrances, never on a close (transitions-polish).

Mechanism for the card table: the bartender redraws the whole table on every change (`rePrintTab()`), so a card cannot be animated by CSS alone. The native View Transitions API does it without a library: `document.startViewTransition(rePrintTab)` with a `view-transition-name` per card (the transaction id, already unique, such as `T00012`). The browser then glides every card from its old place to its new one: a paid card slides to the Paid pile, a cancelled card leaves and the pile closes up, undo and redo slide cards back. Where the API is missing, or under reduced motion, `rePrintTab()` runs as today. The page's own root crossfade is switched off, so only cards move. The language switch also calls `rePrintTab()`; it must not animate (the cards only change their words), so `translate()` keeps the plain call.

| # | Event | Page | Real object and action | Motion | Sound (D4) | Duration | Token | Reduced motion | Accessibility |
|---|---|---|---|---|---|---|---|---|---|
| M1 | New order arrives (Update Orders pressed) | bartender | a card dealt onto the pile | D1: slides in 16 px from the dealer's side with a -4 deg tilt and settles flat | card snap, one per new card (max 3) | 350 ms | `--toast-open`, `--toast-distance`, `--settle-ease` | appears at once | the "(new orders)" announcement (S2); the card's name is unchanged |
| M2 | New order waiting (poll) | bartender | ship's bell rung at the bar | none (the plate already turns alarm red, the seal is pinned) | ship's bell, two strikes | under 1 s | none | no change | announced once (S2); sound never alone |
| M3 | Mark as Paid | bartender | the card slid across the table to the Paid pile | glide to the new place (View Transition); then the PAID stamp lands (M7) | coin on wood | 250 ms glide | `--lift-out`, `--toast-ease` | instant | the toast and live region already say "Marked as paid" |
| M4 | Cancel Order | bartender | the card flicked off the table, the pile squared up | leaving card slides 16 px and fades; the others close up | card flick | 250 ms | `--lift-out`, `--toast-distance` | instant | toast unchanged |
| M5 | Undo, Redo | bartender | cards put back | same glide as M3 | none | 250 ms | `--lift-out` | instant | announced already |
| M6 | Open a card | bartender | a card lifted and its docket slid open | exists; open and close become 250 ms both ways (fix 2) | none (frequent) | 250 ms | `--lift-out` | exists (outline) | unchanged |
| M7 | PAID stamp on the newly paid card | bartender | a rubber stamp pressed down | D2: drops from 1.12 to 1 with opacity 0 to 1, settles | stamp thud | 250 ms | `--lift-out`, `--settle-ease` | appears at once | stamp is text inside the card's name; nothing new is read |
| M8 | Place Stock Order: receipt | management | a slip torn off the pad and laid down | slip falls 16 px and settles flat from 1.5 deg | paper tear | 350 ms | `--toast-open`, `--toast-distance`, `--settle-ease` | appears at once | live region reads the order number (exists) |
| M9 | ORDERED stamp on the receipt | management | stamp pressed after the slip lands | D2, 350 ms after the slip | stamp thud | 250 ms | `--lift-out`, `--settle-ease` | appears at once | decoration; the receipt text carries the state |
| M10 | Add a drink (customer), Add +1/+10/+100 (management) | both | a line written on the ledger | a new row is laid down: falls 4 px and fades in; a repeat add only changes the tally (ink has no motion) | none (frequent) | 250 ms | `--lift-out`, `--toast-ease` | appears at once | announced already ("Heineken added. Total ...") |
| M11 | Place Order (customer) | customer | the order slip handed over the bar | none on the page (it resets); the toast says it | paper rustle; if paid from credit, a coin | under 0.5 s | none | none | toast and live region exist |
| M12 | Press a plate | all | brass or iron plate pressed and sprung back | exists (1 px sink); no change: at 1 px an overshoot is invisible | brass click on Place Order and Place Stock Order only | 150 ms | `--lift-in` | exists | none |
| M13 | Switch tab | all | a paper note pulled up | exists (the note rises); the grid swaps at once. Paper has no motion for a whole list changing, so nothing is added | none | 250 ms | `--lift-*` | exists | `aria-pressed` exists |
| M14 | Language flag pressed | all | a cloth flag tugged on its cord | swings 3 deg about its nail and settles | none | 500 ms | new keyframes on `--settle-ease` | no swing | the words change; nothing is announced today and nothing is added |
| M15 | Login error | landing | a locked door | exists (shake); tokenised (fix 1) | wood knock | 280 ms | `--shake-*` | exists | error text exists |
| M16 | Ghost ship summoned | landing | a ship looming out of the storm | exists (crossfade) | ship's timbers creaking | 250 ms fade, sound under 1 s | `--lift-out` | exists | `aria-pressed` exists |
| M17 | NOT STOCKED seal and CATALOGUE ONLY slot | management | a state, printed when the list loads | none: no user action presses them | none | - | - | - | - |
| M18 | Toast | all | burnt note pinned to the board | exists; the mist follows D6 | none (the event that raised it has its own) | 350/250 ms | `--toast-*` | exists | exists |

Not proposed, and why: no stagger across the drink grid (a whole list appearing has no paper counterpart), no motion on the order total (a number written in ink does not move), no glow, sparkle or confetti anywhere.

## 3. Sound cues

Rules (hard constraints): off by default; one visible, keyboard-reachable mute control per page (D5), a native `<button>` with `aria-pressed` and a visible word; the choice is kept in `localStorage` `SOUND`, and `logOut()` keeps it the way it keeps `STOCK_ORDER_NO` (it clears everything else today); nothing plays on page load; every sound is under 1 s and none loops. Sounds have no text and touch no live region, so nothing is read twice, and every sound sits on an event that already has a visible change and an announcement (the table above).

One function in `js/login.js` (already loaded on every page, next to `announce()`): `sound(name)` plays the named cue if `SOUND` is on and does nothing otherwise. Tests stub it.

**The browser's autoplay rule and the bartender bell.** Browsers do not start audio before the person has pressed, clicked or typed on the page. An `AudioContext` made earlier starts suspended, and `audio.play()` is rejected. Each page is a new document, so logging in on the landing page does not carry over. What that means here:

- The bartender who turned sound on, then reloads or logs in again, sees the control as on, but the first bell can only ring after their first press or key on that page. A new order that arrives before that rings nothing; the red plate, the seal and the announcement still show it.
- So `sound()` resumes the context on the first `pointerdown` or `keydown` anywhere on the page (one listener, removed after it runs), and the unmute press itself counts as that gesture.
- Under the control, while sound is on but not yet allowed, a short note says "Sound starts after your first click" (5 languages). Once allowed, the note goes.

The synthesized demo cues, measured in Chromium by rendering each offline at 48 kHz (length = last sample above -60 dB, peak in dBFS): bell 756 ms, -7.3; card snap 88 ms, -12.9; coin 276 ms, -16.7; stamp thud 105 ms, -6.3; paper tear 307 ms, -14.8; card flick 131 ms, -4.8; paper rustle 141 ms, -19.9; wood knock 176 ms, -12.6; timbers 733 ms, -16.3; brass click 56 ms, -10.5. All are under 1 s. Peaks spread 15 dB, so the chosen set gets level-matched by ear in a real browser before it ships. Noise is random, so lengths vary by a few ms per run.

Sourcing (D3):

| | Web Audio synthesis | Recorded CC0 files |
|---|---|---|
| Realism | fair for bell, thud, knock, click, coin; weak for paper and card riffles | real foley |
| Files | none; about 2 to 4 KB of code | 8 to 10 short files; size measured on download |
| Licence | none needed | CC0 (Kenney Casino Audio, 50 files, card, chip and dice foley; Kenney RPG Audio, 50 files; a CC0 ship's bell from Freesound), each recorded in `docs/ASSETS.md` |
| Code | one synth function per sound | one `new Audio(src).play()` call |
| Demo now | yes, `v12-sound.html` | needs Hassan's yes to download the packs |

## 4. Decisions

Hassan chose on 2026-11-01:

- **D1: A, dealt from the side, but slower: 400 ms.** That needs one more new token, `--deal-dur: 400ms` (the transitions-dev "slow", panel open), because no project token is longer than 350 ms. M1 in the table above runs on `--deal-dur`, not `--toast-open`.
- **D2: A, pressed down** (1.12 to 1, 250 ms, `--settle-ease`).
- **D3: A, recorded CC0 files.** Before any download Claude asks Hassan in chat, naming each file, its source and its size. Licences go into `docs/ASSETS.md`.
- **D4: A, the few cues on bartender and management, plus a tavern ambience loop on the customer page** (follow-up choice A: no music; waves on the hull, creaking timbers, a low tavern murmur; one CC0 loop, about 60 s; at 64 kbps mono that is 60 x 64 000 / 8 = 480 000 bytes, about 480 KB). This is a deliberate exception to "under 1 s, no looping" for this one sound. It still meets WCAG 1.4.2: off by default, it never starts on load, it starts only when the customer presses the Sound plate, and the same plate stops it. On the customer page the Sound plate controls only the ambience (set A gives that page no cues). It also stops when the customer logs out and pauses while the tab is hidden. It plays quietly, so a screen reader stays easy to hear; that is checked in a real browser with a screen reader.
- **D5: A, footer iron plate with the bell icon and the word "Sound".**
- **D6: A, the mist drifts 5 s, then hangs still.**

The options as they were offered, kept for the record:

**D1. How a new order card arrives (M1).** Demo: `v12-motion.html`, section 1.
- A (recommended): dealt from the side, a slide of 16 px with a -4 deg tilt that settles flat, 350 ms. Reads as dealing. Trade-off: the most motion of the three, on the most frequent bartender event.
- B: placed from above, scale 1.04 to 1, shadow from lifted to resting. Quieter. Trade-off: reads as "put down" more than "dealt".
- C: fade in only, 250 ms. Least motion. Trade-off: no material behind it.

**D2. How a stamp lands (M7, M9).** Demo: section 2.
- A (recommended): pressed down, 1.12 to 1 with opacity 0 to 1 on `--settle-ease`, 250 ms. Trade-off: one new token.
- B: ink soaks in, opacity 0.4 to 1 and no movement, 250 ms. Trade-off: no press, so less physical.
- C: no motion, the stamp is there. Trade-off: the stamp's sound (if on) is then the only cue that something landed for sighted users, which is fine visually but loses the press.

**D3. Where the sounds come from.** Demo: `v12-sound.html`.
- A (recommended): recorded CC0 files. Most real. Trade-off: a download, licence lines and a few KB per file.
- B: Web Audio synthesis. No files, no licence. Trade-off: paper and cards sound synthetic.
- C: hybrid, synthesized bell, thud, knock, click and coin; recorded paper and cards. Trade-off: two ways of making sound to keep up.

**D4. Which events get a sound.**
- A (recommended): few. Bell (new order), card snap (dealt), coin (paid), stamp thud (PAID, ORDERED), paper tear (receipt), card flick (cancel). Bartender and management only. Trade-off: the customer page and the landing page stay silent except for the control.
- B: few plus the landing (wood knock on login error, timbers on the ghost ship) and the customer (paper rustle on Place Order, coin when paid from credit).
- C: B plus brass clicks on every primary plate. Trade-off: frequent sounds tire a bartender over a shift.

**D5. The mute control.** Demo: section 3.
- A (recommended): an iron plate in the footer (the Log Out plate, white 5.5:1 at rest and 4.58:1 on hover, measured in F6) with a Lucide bell or bell-off icon and the word "Sound". Trade-off: one more plate in a footer that already holds Undo and Redo words; it must be fit-checked at 320 px in Spanish.
- B: the same plate, icon only (word hidden for screen readers), 44 px square. Trade-off: an icon alone is less clear.
- C: a plate in the header beside the staff nameplate. Trade-off: the landing and customer pages have no nameplate, so the control moves from page to page.

**D6. The mist and WCAG 2.2.2.** Demo: section 4.
- A (recommended): the mist drifts for the first 5 s and then hangs still. CSS allows a fractional iteration count, so the 40 s layer gets `animation-iteration-count: 0.125` and the 55 s layer `0.0909` (5 / 40 and 5 / 55) with `animation-fill-mode: forwards`. Speed is unchanged. Trade-off: a long toast ends with still mist.
- B: no drift; the mist just fades in and out with the note. Trade-off: loses the drift.
- C: keep the drift and cap every toast at 5 s. Trade-off: cuts reading time for long messages, a worse problem (WCAG 2.2.1).

## 5. Build guide (for a new session)

Written so a new session (Sonnet) can build V12 step by step without this conversation. Line numbers are from commit `3f3b287`; search for the quoted code if they have moved.

### Session rules

- Read first: `CLAUDE.md`, this file, `DESIGN.md` (Components, Feedback), `docs/ASSETS.md`. Follow CAVEMAN (terse chat) and PONYTAIL (shortest diff, reuse helpers, no new dependency).
- Branch `polish`, working tree clean at the start. Start the server with the `dutchman` launch config (port 8080). Baseline: `npx playwright test --list` shows 238 tests; run `npm test` once and note any that already fail (the management axe test is known to time out under parallel load and passes alone: `npx playwright test management -g axe`).
- One step at a time, in order. After each step: run its new tests, then `npm test`; report the result to Hassan in 3 lines and wait for his "next". Never commit or push unless Hassan asks.
- Stop points where Hassan decides (never decide for him): every file download (name the file, its source page, its licence and its size first), the pairing audition picks (5b), anything that changes a decision in section 4, and any step that would change existing test assertions.
- Hard rules: colour literals only in `:root` of `css/style.css`; font sizes and weights only from tokens; every motion has a reduced-motion guard (`@media (prefers-reduced-motion: reduce)`, already present at the end of each CSS block group); UI strings in 5 languages (English, Swedish, Italian, Spanish, Pirate) in the `js/view/*.js` arrays; axe 0 violations; no sideways scroll at 320 and 375 px; targets 24 px (44 on phones).
- Motion tokens to use (all in `:root`, `css/style.css` lines 79-98): `--toast-open` 350ms, `--toast-close` 250ms, `--toast-distance` 16px, `--toast-ease`, `--lift-in` 150ms, `--lift-out` 250ms, `--lift-distance` 2px, `--revert-dur` 280ms. New in S4 and S5: `--settle-ease`, `--deal-dur`. No other new motion tokens and no literal durations in `transition` or `animation` (the mist's 40s and 55s loop lengths are the one exception and stay as they are).
- Put all new motion tests in one new file, `tests/motion.spec.js`, using `login()`, `startSR()`, `heard()` and `count()` from `tests/helpers.js`.

### S1. The two token fixes

1. `css/index.css` lines 541-560 (`.t-input`, `.t-input.is-error`, `.t-error-msg`, `.t-input-wrap.is-error .t-error-msg`): replace `150ms ease-out` with `var(--lift-in) var(--toast-ease)`; replace every `var(--revert-dur, 280ms) ease-out` with `var(--revert-dur) var(--toast-ease)`; replace `visibility 0s linear var(--revert-dur, 280ms)` with `visibility 0s linear var(--revert-dur)`. Leave `@keyframes t-input-shake` alone.
2. `css/bartender.css`: in `.pc:has(> .accordion.active)` (about line 177-184) delete the line `transition-duration: var(--lift-in);`. In line 282, `.accordion.active + .panel { ... transition: grid-template-rows var(--lift-in) var(--toast-ease); }`, change `--lift-in` to `--lift-out`. Keep the `transition-duration: var(--lift-in)` in `.pc:hover, .pc:has(.accordion:focus-visible)`: a hover lift is quick in, slow out on purpose.

Tests (`tests/motion.spec.js`):
- Landing: `getComputedStyle(#user_name_input)` (or whichever input has `.t-input`) has `transitionDuration` `0.15s` and `transitionTimingFunction` `cubic-bezier(0.22, 1, 0.36, 1)`.
- Bartender: open the first card; `.panel` of that card has `transitionDuration` starting `0.25s`; close it; still `0.25s`. The open `.pc` has no `0.15s` in its `transitionDuration`.
- Source check: read every `css/*.css` file with `fs`; no `transition` or `animation` declaration contains a duration literal other than `0s`, `40s` or `55s` (regex on lines containing `transition` or `animation`, matching `\b[1-9]\d*(\.\d+)?m?s\b`, ignoring lines inside the `:root` blocks).

Done when: the new tests pass, `npm test` is as green as the baseline.

### S2. Announce new orders (WCAG 4.1.3)

`js/bartender.js` lines 29-34, `checkOnOrders()`. Today it adds `.has-new` and resets `NEWORDER`, but says nothing. Change to announce once per batch (only when the plate was not already lit):

```js
function checkOnOrders() {
    if (localStorage.getItem("NEWORDER") == 1) {
        if (!$("#retrieve_orders").hasClass("has-new")) announce(tab_update[lang()] + new_orders_label[lang()]); // "Update Orders (new orders)"
        $("#retrieve_orders").addClass("has-new");
        localStorage.setItem("NEWORDER", 0);
    }
}
```

`announce()` is in `js/login.js` line 99; `tab_update` and `new_orders_label` are in `js/view/view_bartender.js` (check `tab_update` exists there; it is used by `translate()` at line 369). The S8 bell goes on the same line later.

Tests: copy the order-injecting `page.evaluate` from `tests/bartender.spec.js` lines 63-68. After `startSR(page)`, inject an order, wait until `#retrieve_orders` has `has-new`, then `heard()` contains "(new orders)" exactly once (`count()`). Inject a second order before clicking Update Orders, wait 2.5 s (one poll), `heard()` has no "(new orders)".

### S3. The mist stops drifting after 5 s (WCAG 2.2.2, D6 A)

1. `css/style.css` line 959: `animation: mist-drift 40s linear infinite paused;` becomes `animation: mist-drift 40s linear 0.125 forwards paused; /* 5 s of drift, then still (WCAG 2.2.2) */`.
2. Line 967: `animation: mist-drift 55s linear infinite reverse paused;` becomes `animation: mist-drift 55s linear 0.0909 reverse forwards paused;`.
3. A finished animation does not restart by itself on the next toast, so `showToast()` in `js/login.js` (line 106) restarts it. After `toast.addClass("is-open");` add:

```js
$(".toast_wrap")[0].getAnimations({ subtree: true }).forEach(function (a) { a.currentTime = 0; }); // the mist drifts 5 s from each new toast
```

Tests: call `showToast('Order paid', 'Paid from your credit. Pick up your drinks in the VIP fridge.')` with `page.evaluate`; wait 5.5 s; the `mist-drift` animations of `.toast_wrap` have `playState` `finished`. Call `showToast` again; within 500 ms they are `running` with `currentTime` under 1000. Under `page.emulateMedia({ reducedMotion: 'reduce' })` there are no `mist-drift` animations. The existing test "toasts: reduced motion stops the mist drifting" (`tests/textures.spec.js` line 355) must still pass.

### S4. `--settle-ease`, the receipt slip and the ORDERED stamp (M8, M9, D2 A)

1. `:root` motion block in `css/style.css` (after `--lift-out`, line 97):

```css
  --settle-ease: cubic-bezier(0.34, 1.36, 0.64, 1); /* things that land: 4.3 % overshoot at 64 % of the time (transitions-dev --ease-bounce) */
```

2. Shared keyframes in `css/style.css`, next to `@keyframes mist-drift`:

```css
/* V12: a stamp pressed onto paper, a slip laid down */
@keyframes stamp-press { from { scale: 1.12; opacity: 0; } 40% { opacity: 1; } }
@keyframes slip-lay { from { translate: 0 calc(-1 * var(--toast-distance)); rotate: 1.5deg; opacity: 0; } 40% { opacity: 1; } }
```

The stamps already use the `rotate` property and `transform: skewX()`; `scale` and `translate` are separate properties, so they do not fight.

3. `css/management.css`: `.receipt` (line 196) gets `animation: slip-lay var(--toast-open) var(--settle-ease);`. `.receipt_stamp` (line 243) gets `animation: stamp-press var(--lift-out) var(--settle-ease) var(--toast-open) backwards;` (the stamp comes down after the slip has landed; `backwards` keeps it hidden until then). Add `@media (prefers-reduced-motion: reduce) { .receipt, .receipt_stamp { animation: none; } }`.
4. No JS change: `showReceipt()` (`js/management.js` line 374) creates the slip once; `translateReceipt()` only changes text, so a language switch does not replay it.

Tests: log in as manager, Add +1 on the first drink, Place Stock Order. `.receipt` has one animation `slip-lay`, duration 350, easing `cubic-bezier(0.34, 1.36, 0.64, 1)`; `.receipt_stamp` has `stamp-press`, duration 250, delay 350. Switch language: no animation runs on `.receipt`. With reduced motion: no animations, and both are at opacity 1.

Then build the first pairing page rows for "receipt" and "stamp" (section 5b). Stop for Hassan's picks.

### S5. The card table: glide, deal, stamp (M1, M3, M4, M5, M7, D1 A at 400 ms)

1. `:root` motion block: `--deal-dur: 400ms; /* a card dealt onto the pile (D1) */`.
2. `js/bartender.js`, near `rePrintTab()` (line 340):

```js
// V12: cards glide to their new places (View Transitions). Not under reduced motion, and not where the browser lacks the API
function animated(change) {
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return change();
    document.startViewTransition(change);
}

var seen = null, fresh = [], stamping = null; // ids already printed (null before the first print, so the first table is not dealt); ids dealt now; id just paid
```

At the top of `rePrintTab()`, before the HTML is built:

```js
    fresh = seen ? $.map(SESSIONS_TRANSACTIONS, function (o) { return seen[o.transaction_id] ? null : o.transaction_id; }) : [];
    seen = seen || {};
    $.each(SESSIONS_TRANSACTIONS, function () { seen[this.transaction_id] = true; });
```

At the end of `rePrintTab()`, after `.html(html)`: `stamping = null;`.

3. `cardHTML()` (line 164): the opening `<div class="pc ...">` gets the extra class and the transition name. A dealt card has no name, so it is not part of the glide and plays its own deal; its place in the deal order staggers it:

```js
    var n = fresh.indexOf(element.transaction_id);
    var content = '<div class="pc ' + (element.paid ? 'paid' : 'open') + (n > -1 ? ' dealt' : '') + (element.transaction_id == stamping ? ' stamped' : '') + '"' +
        ' style="' + (n > -1 ? '--n: ' + Math.min(n, 2) : 'view-transition-name: ' + element.transaction_id) + '">' +
```

4. Use `animated()` where a person changes the table, and keep the plain call elsewhere:
   - `.pay` click (line 115): set `stamping = find_transaction_id;` before the reprint, and wrap: `animated(rePrintTab);` in place of `rePrintTab();`.
   - `.delete` (Cancel) click (line 106): `animated(rePrintTab);`.
   - `undo()` and `redo()` (lines 275-307): `animated(rePrintTab);`.
   - `updateTransactions()` (line 354, called by Update Orders): `animated(rePrintTab);`.
   - Leave plain: the tab clicks (line 47), `translate()` (line 372, language switch), the first print.
5. `css/bartender.css`:

```css
/* V12: cards glide (View Transitions), a new order is dealt, a paid card is stamped */
::view-transition-old(root), ::view-transition-new(root) { animation: none; } /* only the cards move, not the page */
::view-transition-group(*) { animation-duration: var(--lift-out); animation-timing-function: var(--toast-ease); }
::view-transition-old(*):only-child { animation: card-leave var(--lift-out) var(--toast-ease) forwards; } /* a cancelled card slides off */
@keyframes card-leave { to { translate: var(--toast-distance) 0; opacity: 0; } }
@keyframes deal { from { translate: calc(-1 * var(--toast-distance)) calc(-1 * var(--toast-distance)); rotate: -4deg; opacity: 0; } 30% { opacity: 1; } }
.pc.dealt { animation: deal var(--deal-dur) var(--settle-ease) calc(var(--n, 0) * var(--lift-in)) backwards; }
.pc.stamped .o_state { animation: stamp-press var(--lift-out) var(--settle-ease) var(--lift-out) backwards; } /* after the glide */
```

   Add `.pc.dealt, .pc.stamped .o_state { animation: none; }` to the reduced-motion block at line 517. The deal's `from` tilt animates to the card's own `rotate` (plus or minus 0.5 deg), so no `to` frame.
6. Check by hand in the browser pane (Chromium) and note in the report: Mark as Paid glides the card to the Paid pile and then the PAID stamp lands; Cancel slides the card off and the pile closes up; Update Orders deals the new card while the others glide down one place; switching tab or language moves nothing.

Tests:
- `addInitScript` that counts calls: `if (document.startViewTransition) { const f = document.startViewTransition.bind(document); window.vtCalls = 0; document.startViewTransition = (cb) => { window.vtCalls++; return f(cb); }; }`. In browsers without the API, skip the count assertions (`test.skip` when `vtCalls` is undefined), keep the rest.
- Mark as Paid: `vtCalls` 1; the card ends in the Paid pile (reuse the existing assertion style in `tests/bartender.spec.js`); that card's `.o_state` runs `stamp-press` with delay 250.
- Switch tab, then switch language: `vtCalls` stays 0.
- Inject a new order (as in S2), press Update Orders: exactly one `.pc.dealt`, running `deal` for 400 ms with the settle easing; no other card is `.dealt`. Reload: no card is `.dealt`.
- Reduced motion: `vtCalls` 0 after Mark as Paid; no `.pc` has running animations; the paid card is in the Paid pile.
- Existing tests: if any bartender test now fails because a click lands during a 250 ms glide, add `test.use({ contextOptions: { reducedMotion: 'reduce' } })` at the top of that spec file only, and say so in the report. Do not loosen any assertion.

Then add pairing rows for "card dealt", "Mark as Paid", "Cancel" and "new order bell" (5b). Stop for Hassan's picks.

### S6. Ledger rows (M10) and flags (M14)

1. Ledger rows, `css/style.css` near `#drink_selection .order` (line 750):

```css
@keyframes row-lay { from { translate: 0 calc(-2 * var(--lift-distance)); opacity: 0; } } /* a line written on the ledger */
#drink_selection .order.laid { animation: row-lay var(--lift-out) var(--toast-ease); }
```

   and `#drink_selection .order.laid { animation: none; }` in the reduced-motion block at line 824.
   In `js/customer.js` `addOrder()` (line 266) and `js/management.js` `addOrder()` (line 331), the prepended row starts `'<div class="order laid" id="'`. Undo and redo rebuild the whole ledger through `addOrder()`, which would replay every row, so at the end of `setOrderTo()` in both files (customer line 360, management line 453) add `$("#drink_selection .order").removeClass("laid"); // undo/redo rewrite the ledger; only a new line is laid down`. A repeat Add only changes the tally (no class), which is right: ink does not move.
2. Flags, `js/multilanguage.js` click handler (line 29), before `setLanguage(index)`:

```js
            var cloth = this.querySelector(".languages");
            cloth.classList.remove("swing"); void cloth.offsetWidth; cloth.classList.add("swing"); // the cloth swings on its cord
```

   `css/style.css` near the flag rules (line 434). The flags already use the `rotate` property for the cord's sag, so the swing uses `transform`, which adds to it:

```css
@keyframes swing { 30% { transform: rotate(3deg); } 65% { transform: rotate(-1deg); } } /* a cloth flag tugged on its cord */
footer .languages.swing { animation: swing calc(2 * var(--lift-out)) var(--settle-ease); }
```

   and `footer .languages.swing { animation: none; }` in a reduced-motion block. `transform-origin: 50% 0` is already set (line 391), so it swings from the cord.

Tests: customer, click a drink: the new `.order` runs `row-lay` once; click the same drink: no animation on that row; Undo: no `.order` is animating. Click the Swedish flag: its `.languages` runs `swing` for 500 ms; reduced motion: none.

### S7. The Sound plate (D5 A), no sound yet

1. Icons: add Lucide `bell` and `bell-off` symbols to `img/icons.svg` (paths, ISC, as used in `docs/visual-options/v12-motion.html`). Note them in the `icons.svg` row of `docs/ASSETS.md`.
2. Strings in `js/view/view_common.js` (5 languages, same array style as `undo_label`): `sound_label` = "Sound", "Ljud", "Suono", "Sonido", "Sound" (Pirate: Hassan may want a pirate word; ask in the report, do not invent one), and `sound_wait` = "Sound starts after your first click." in 5 languages (ask Hassan to check the 4 translations, as in `docs/issues/strings-review.md`).
3. Markup, built once in `js/login.js` (loaded on all 4 pages) so no HTML file needs a copy: in the `$(function () {...})` block (line 137), append to `footer`:

```js
    $("footer").first().append('<button type="button" id="sound" class="small_button" aria-pressed="false">' +
        '<svg class="icon" aria-hidden="true"><use href="img/icons.svg#bell-off"/></svg> <span class="sound_label"></span></button>');
```

   Place it next to Log Out in the visual order (on the landing page, beside the flags); check the footer flex order at 769 px and up (`css/style.css` line 358) and the phone footer.
   `setLanguage()` in `js/multilanguage.js` sets `$(".sound_label").text(sound_label[index]);`.
4. Style: add `#sound` to the iron plate selectors in `css/style.css` lines 590-618 (`#logout, #logout_phone, #undo, #redo, #retrieve_orders` and their `:hover`, `:active`, `:focus-visible` and reduced-motion lists). That reuses the measured plate (white 5.5:1 at rest, 4.58:1 on hover); no new colour.
5. State, in `js/login.js` next to `announce()`:

```js
function soundOn() { return localStorage.getItem("SOUND") == "on"; }
function setSound(on) {
    localStorage.setItem("SOUND", on ? "on" : "off");
    $("#sound").attr("aria-pressed", on).find("use").attr("href", "img/icons.svg#" + (on ? "bell" : "bell-off"));
}
```

   On load: `setSound(soundOn());`. Click: `$(document).on("click", "#sound", function () { setSound(!soundOn()); });`.
   `logOut()` (line 129) keeps `SOUND` the way it keeps `STOCK_ORDER_NO`.

Tests: on each of the 4 pages: `#sound` exists once, is a `button`, `aria-pressed="false"` on first visit, its name is "Sound" (and "Ljud" after the Swedish flag); Tab reaches it; Enter toggles `aria-pressed`; the choice survives a reload and `logOut()`. axe 0 on all 4 pages. Fit: no sideways scroll at 320 and 375 px in all 5 languages, and the plate does not overlap Undo, Redo or the flags at 769, 1024 and 1280 px (bounding boxes). Height at least 44 px on phones.

### S8. `sound()` and the cues (D3 A, D4 A), after the pairing picks

Only after Hassan has picked a file per event in the pairing page and approved each download.

1. Files go in `audio/` as MP3 (plays in Chromium, Firefox and Safari), each under 1 s, trimmed and level-matched with `ffmpeg` (installed). Record each in a new "Sounds" table in `docs/ASSETS.md`: file, used for, source URL, author, licence, byte size, length.
2. `js/login.js`:

```js
// V12 sound cues: off unless the Sound plate is on. Browsers allow audio only after a press or key on the page,
// so a cue before that plays nothing (play() is refused) and the visual and spoken signals carry the event alone
function sound(name) {
    if (!soundOn()) return;
    var cue = new Audio("audio/" + name + ".mp3");
    cue.volume = 0.6;
    cue.play().catch(function () {});
}
```

   While sound is on but the page has had no press or key yet, show `sound_wait` under or beside the plate (a `<small>` with the text, removed on the first `pointerdown` or `keydown`). `navigator.userActivation.hasBeenActive` tells whether it has; where that is missing, show nothing.
3. Calls (D4 A), each next to the existing visible change:
   - bartender, `checkOnOrders()` in the S2 `if`: `sound("bell");`
   - bartender, Update Orders when cards are dealt: `sound("deal");` (once, not per card)
   - bartender, `.pay` click: `sound("coin");`, and if Hassan's pairing pick wants the stamp too, `setTimeout(function () { sound("stamp"); }, 250 + 119);` (the stamp starts after the 250 ms glide and touches the paper 119 ms into its press, see "contact" below).
   - bartender, Cancel: `sound("flick");`
   - management, after `showReceipt()`: `sound("tear");` and `setTimeout(function () { sound("stamp"); }, 350 + 119);` (the stamp starts at 350 ms).

Contact times, measured: `--settle-ease` first reaches its end value at 47.4 % of the duration (then overshoots and settles). So a stamp (250 ms) touches the paper at 119 ms and a dealt card (400 ms) at 190 ms. Sounds are timed to these moments, not to the click.
   - Nothing on the customer and landing pages (they get only the plate and, on the customer page, S8b).
4. No sound touches `#live` or the toast.

Tests: `addInitScript` replaces `HTMLMediaElement.prototype.play` with a recorder (`window.played = []; HTMLMediaElement.prototype.play = function () { window.played.push(this.src.split('/').pop()); return Promise.resolve(); };`). Assert: nothing played on load of any page, even with `SOUND` set to `on` before load; nothing played while off; each event plays its one file; the bell once per batch; no file is longer than 1 s (`ffprobe` in a Node test, or read `duration` after `loadedmetadata`); the screen reader log shows no extra or doubled phrase compared with sound off (`count()`).

### S8b. The customer ambience loop (D4 follow-up A)

After Hassan picks the loop in the pairing page and approves the download. One CC0 file, about 60 s, MP3 64 kbps mono (about 480 KB), loop point crossfaded so there is no click.

`js/login.js`, customer page only (`location.pathname` ends with `customer.html`): the Sound plate starts and stops the loop instead of enabling cues.

```js
var ambience; // customer page: the tavern around you, only while the Sound plate is on
function setAmbience(on) {
    ambience = ambience || Object.assign(new Audio("audio/tavern.mp3"), { loop: true, volume: 0.25 });
    if (on && !document.hidden) ambience.play().catch(function () {}); else ambience.pause();
}
```

Call `setAmbience(on)` from the plate's click (that click is the gesture, so it plays at once). On load with `SOUND` on, do not play; show `sound_wait` and start on the first press or key. `document.addEventListener("visibilitychange", ...)` pauses it while hidden and resumes when visible if still on. `logOut()` pauses it before leaving.

Tests: with the `play` recorder: no play on load even with `SOUND` on; the plate starts it and the next press pauses it (`paused` true); `visibilitychange` to hidden pauses it (dispatch the event after overriding `document.hidden` with `Object.defineProperty`); a screen-reader pass of the customer page with ambience on hears the same phrases as with it off. Real browser: Hassan listens with Orca or another screen reader at the chosen volume.

### S9. Documentation

- `DESIGN.md`: a "Motion" section (the tokens with `--settle-ease` and `--deal-dur`, the event table's motion column, the reduced-motion rule, the View Transitions note); the Sound plate under Buttons; the toast mist line updated (drifts 5 s); the bartender section (deal, glide, stamp); remove the stale "Bartender order accordion (signature)" paragraph that still says `max-height` 0.2 s.
- `docs/ASSETS.md`: bell icons, every sound file.
- `docs/audit-baseline.md`: "V12 done" entry in the style of the F entries, with test count and what was checked in a real browser.
- Update the status line at the top of this file.



## 5b. Sound pairing audition (added 2026-11-01)

Hassan heard the synthesized set and found it neither memorable nor on theme enough. So no sound is chosen on paper. When a motion is built (S4, S5, S6), Claude makes a pairing page, `docs/visual-options/v12-pairing.html`, before any cue is wired into the app:

- One row per event, with the motion exactly as built (same CSS, same tokens), on the real textures.
- Two or three sound alternatives per event, recommended first, each named by its real object and action. Pressing an alternative replays the motion with that sound, timed to the moment of contact (the card's landing, the stamp's hit), not to the click.
- A row for "no sound", so silence is always one of the choices.
- The length and peak of each file are measured on the page, and the files are level-matched to each other before Hassan listens.
- Hassan picks one per event (or asks for others); only that file is kept, licensed in `docs/ASSETS.md` and wired in at S8.

How to build it (S4 builds the page with the receipt and stamp rows; S5 and S6 add their rows):
- Start from `docs/visual-options/v12-motion.html` (same tokens block, textures, replay buttons). Copy the keyframes and rules exactly as they are in the app CSS after the step, so the page shows the motion that ships.
- Find candidates on CC0 sources (Kenney audio packs, Freesound filtered to CC0, Sonniss GDC bundles only if their licence allows a public repository). List each candidate to Hassan with its source page, author, licence and byte size, and download only what he approves into `docs/visual-options/audio/`, one folder per event. Delete the ones not chosen after his pick; never commit a file he did not choose.
- Trim each to under 1 s and level-match with `ffmpeg` (`loudnorm` to the same integrated loudness, about -20 LUFS, then the cue volume 0.6 in the app), output MP3.
- Play each sound with `new Audio()` at its contact time: `setTimeout(play, delay + 0.474 * duration)` (the contact moment of `--settle-ease`, measured), or at the click for events with no landing (bell, flick, tear).
- Show each file's length (from `loadedmetadata`) and byte size on the page.
- Send the page link to Hassan with `SendUserFile` and ask with `AskUserQuestion`, one event per question, recommended first, with "No sound" as an option.

Candidates to audition, aiming for sounds a guest would remember from a ship's tavern. Each is short and recorded; files are found and their size and licence shown to Hassan before download.

| Event | Alternative 1 | Alternative 2 | Alternative 3 |
|---|---|---|---|
| New order waiting (bartender) | ship's bell, two strikes ("two bells") | boatswain's pipe, one short call | pewter tankard set down hard on the bar |
| Card dealt (M1) | card snapped down on felt | card slid and tapped square | short riffle as the card leaves the deck |
| Mark as Paid (M3) | coins dropped into a wooden chest | single gold coin spun and settling on the bar | coin purse set down, coins shifting |
| Stamp lands (M7, M9) | heavy iron hand stamp on a wooden desk | wax seal pressed, a soft crack as it sets | rubber stamp on a paper pad |
| Receipt (M8) | paper torn along a ruler | quill scratch, then the slip torn off | parchment unrolled and laid flat |
| Cancel Order (M4) | card flicked across the table | card torn in two | card tossed into a wooden bucket |
| Customer ambience (D4) | waves on the hull, creaking timbers | the same plus a low tavern murmur and a distant gull | harbour at night: rigging, water, a far bell |

A "boatswain's pipe" and "two bells" are tonal. The brief rules out music; a single call or strike is a signal, not a tune, so they stay in as alternatives and Hassan decides.

## 6. Test plan

Playwright can assert:
- Computed styles: transition durations and easings equal the tokens; `getAnimations()` count and timing on a landed stamp, a dealt card, a new ledger row.
- Reduced motion: `page.emulateMedia({ reducedMotion: 'reduce' })`, then no running animations on the page, no `startViewTransition` call (spied with `addInitScript`), every element at its final opacity and place.
- Mute state: off on first visit, `aria-pressed`, the visible word, `localStorage.SOUND` after reload and after `logOut()`.
- Sound calls through a stub: `addInitScript` replaces `window.sound` (or `HTMLMediaElement.prototype.play` and `AudioContext`) with a recorder. Assert: no call on load; no call while muted; one call with the right name per event; the bell once per batch.
- No double announcement: the existing `count()` helper on the virtual screen reader log.
- View Transitions block clicks for 250 to 350 ms while they run. The existing 224 tests are kept stable by setting `reducedMotion: 'reduce'` as the default in `playwright.config.js`; the new motion tests opt back in with `no-preference`.

A real browser is needed for: how each sound actually sounds and how loud it is; the autoplay rule on a real first click (test runners may relax it); the feel of the settle; View Transitions in Firefox and Safari; and a screen reader with sound on, to hear that the bell and the announcement do not clash.

Out of scope: V13 (empty and error states), the case study, any commit.
