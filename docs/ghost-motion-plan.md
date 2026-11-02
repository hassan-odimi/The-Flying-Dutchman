# V12b ghost motion: picks

Status 2026-11-02: plan final, ready to build. Motion and sound are picked for every spot, and a new session builds them from section "Build guide" below, step by step. Hassan picked one option per spot with the interactive demo `docs/visual-options/v13-ghost.html` (open it via `http://localhost:8080`). This builds on V12 (`docs/motion-sound-plan.md`) and is separate from V13 (empty and error states).

## The principle

Where V12 follows 1850s tavern physics, V12b gives the app the Flying Dutchman's haunting: fog, smoke, things forming out of mist and dissolving into it. Wind is still physical: the flags and slips move like cloth and paper in a draught. While a thing is forming it shows the pale green of the Dutchman's lanterns (`--ghost-tint`). At rest it has no tint, so text contrast does not change.

## Picks

| # | Spot | Pick | Tuned values (from the demo) |
|---|---|---|---|
| G1 | Flag hover and focus | A, with a stronger gust and a longer settle | A damped spring per flag: up to 6°, stiffness 22, damping 3.5, gust period 260 ms, cloth skew 0.08 × velocity. Neighbours get 35 % of the push, about 2°. Simulated: still again 2.9 s after the pointer leaves. A flag already moving keeps its motion, so a sweep looks like one gust. Replaces the V12 swing on press (M14). |
| G2 | About and Passwords slips | A, a bit longer, and a different pattern per slip | Same script as G1. About: heavy and slow, 0.6 Hz (stiffness 14, damping 2.6, gust 330 ms), 3.6 s to rest. Passwords: quicker, 0.8 Hz (stiffness 26, damping 2.8, gust 190 ms), with a fast paper flutter, 3.8 s to rest. Replaces today's straighten-and-drop. |
| G3 | Drink cards, first load | A, with a slow, aged skull of smoke first (reworked 2026-11-02) | The skull SVG is masked by luminance (white fill shows, black lines are gaps), then intersected with `stamp-wear.webp` for wear. It is filled with yellowed bone (`#b9b59c`), tarnish stains and mist. One SVG filter (`#smoke`) does three things: (1) `feTurbulence` + `feDisplacementMap` curl its edges; (2) a cloudy noise passed through `feFuncA` (slope 5) sets where the skull shows, and the intercept goes from -4 to -0.1 over 2 s (smoothstep), so it condenses out of the fog and never looks quite solid; (3) fine noise (0.8) punches pits for grit. It holds for 0.7 s. Then the fog takes it back over 1.4 s: the intercept falls, the displacement grows 16 to 136, and it drifts up and fades. Card wisps appear as it goes, and at 3.1 s the cards condense out of them (8 px blur, 40 ms apart, max 8). About 4 s in all, once per page load. |
| G4 | Tab switch | Spectral trail (redesigned 2026-11-02, haze dropped) | It must show even when no card moves: in the real app the beers come first in All Drinks, so All to Beers keeps every beer in its seat. Every kept card goes pale (opacity 0.45, ghost tint, 2 px blur, at 45 % of 1.1 s) and throws three echoes. The echoes start at 0, 140 and 280 ms, at opacity 0.45, 0.3 and 0.18, and rise 8, 16 and 24 px as they fade over 1.0 to 1.2 s. A card that moves glides (1.1 s, `cubic-bezier(0.45, 0, 0.2, 1)`) and leaves its echoes along the path. The cards go in a wave from the top left, capped at 600 ms across the grid. Leaving cards fade as ghosts (700 ms), and new cards condense (800 ms, 30 ms apart). About 2.2 s in all. Build: View Transitions for the glide, plus clones for the echoes, or the same FLIP and clone approach as the demo. |
| G5 | Page arrival and Log Out | A, longer and slower | Cross-document View Transitions (`@view-transition { navigation: auto; }`). The old page sinks into the fog (700 ms, ease-in). A slow bank of mist passes (1.4 s). The new page condenses pale, then solid (900 ms, from 500 ms). 1.4 s in all. Firefox loads plainly. |
| G6 | Login, About, Passwords dialogs | A, longer and slower | The sheet condenses from a pale 8 px blur and 1.03 scale in 900 ms, and dissolves in 400 ms. A mist puff passes over 1.4 s. The overlay darkens in 600 ms. |

## Settled for the build

- **The skull's look.** Approved after the rework. The skull and the G4 echoes run SVG filters and clones, so check the frame rate on a phone during the build (step B10).
- **The first load is about 4 s.** The cards are in the DOM from the start (screen readers and keyboard reach them at once). A press or key anywhere ends the intro and shows the cards (step B6). If Hassan wants no skip, it is one listener to remove.
- **The skull's licence.** `docs/visual-options/skull.svg` (moved to `img/skull.svg` in B6) comes from Wikimedia Commons and is public domain (the page says it is "ineligible for copyright" as simple geometry). It is listed in `docs/ASSETS.md`.
- **Clicks during a transition.** G5 blocks clicks for 1.4 s on arrival. G4 takes about 2.2 s, which is fine if it does not block clicks (the demo's FLIP and clone approach does not; View Transitions would). Test whether that feels slow in use.
- **Reduced motion.** Every spot becomes an opacity-only fade. There is no skull, no wind, no haze, no blur.
- **WCAG 2.2.2.** Every motion ends within 5 s. The longest are the G3 intro (about 4 s) and a slip settling (3.8 s).
- **Tokens.** Settled in step B1: every CSS duration is a `:root` token, because the V12 test "no literal durations" fails otherwise. Durations used only by JS (the spring, the skull timeline, the echoes) stay as named constants in the JS.
- **Tests.** The V12 test approach applies: reduced motion is the suite default, and the motion tests opt back in.
- **Order.** Build after V12 is finished and committed.

## Sound (exploring, 2026-11-02)

Hassan approved downloading 6 CC0 Freesound previews. Seven cues are cut from them, level-matched, and paired with the motions in the demo: each section has a Sound row (see `docs/ASSETS.md`). The V12 rules still apply: sound is off by default, the Sound plate controls it, and no cue is wired into the app before Hassan picks it.

Limits found:
- **Hover is not a gesture.** Browsers allow audio only after a click or key press on the page. G1 and G2 can sound on hover only after the first click. The wind sounds play at most once per 2.5 s and at 35 % volume, so a sweep across the flags is one sound, not five.
- **G3 and G5 happen on a newly loaded page,** which starts locked. A skull sound on first load, or an arrival sound, cannot play in the real app. The way round this for G5 is to play the sound on the old page at the Login or Log Out press (that press is a gesture), and to delay the navigation by about 700 ms so the sound is heard as the old page sinks into the fog. G3 gets no sound in the app unless the skull also plays on later visits after a click; that is Hassan's decision.
- **Frequent events.** V12 gave no sound to frequent actions. G4 (tab switch) is frequent, so it plays at 50 % volume, and "No sound" is a real option.
- **Authenticity.** `ai-whisper` is AI-generated (ElevenLabs), not a recording. It is labelled as such and kept only if Hassan picks it.

### Sound picks (Hassan, 2026-11-02)

| # | Spot | Sound | File | Volume | Notes |
|---|---|---|---|---|---|
| G1 | Flags | none | - | - | The wind is seen, not heard. |
| G2 | Slips | paper flapping | `paper-flap.mp3` (344370) | 0.35 | At most once every 2.5 s, and only after the first click on the page. |
| G3 | Skull | creepy whoosh, long | `creepy-long.mp3` (840812) | 0.8 | The page has no click yet on first load. Build: if Sound is on, start the cue at the first click or key press while the skull is still on screen, offset to the skull's progress, and play nothing once it has gone. |
| G4 | Tab switch | creepy whoosh, 2.8 s (cut for the tab switch, so it outlasts the 2.2 s wave) | `creepy-tab.mp3` (840812) | 0.5 | Plays on every switch. |
| G5 | Page arrival and Log Out | distant foghorn | `foghorn.mp3` (140898) | 0.8 | Played on the old page at the Login or Log Out press, and the navigation waits about 700 ms. With Sound off there is no wait. |
| G6 | Login, About, Passwords dialogs | ghostly whoosh | `ghost-whoosh.mp3` (850767) | 0.7 | Login therefore plays the whoosh when the dialog opens and the foghorn when it is submitted. |

Not used: `flag-flap`, `creepy-short`, `ai-whisper`. Delete them from `docs/visual-options/audio/ghost/` at build time, and copy the picked files to `audio/`.

## Build guide (for a new session)

Written so a new session (Sonnet) can build V12b without this conversation. Code is quoted by search string, not line number, because V12 is still settling. The demo `docs/visual-options/v13-ghost.html` is the reference for every value: when this guide and the demo disagree, ask Hassan.

### Session rules

- Read first: `CLAUDE.md`, this file, `docs/motion-sound-plan.md` sections 2, 3 and 5 "Session rules" (they all still apply), `DESIGN.md` (Motion), `docs/ASSETS.md`. Open the demo at `http://localhost:8080/docs/visual-options/v13-ghost.html` and play every section once.
- **Precondition: V12 is committed.** Run `git status`. If `js/`, `css/` or `tests/` have uncommitted changes, stop and ask Hassan; do not build on an uncommitted V12.
- Branch `polish`. Start the server with the `dutchman` launch config (port 8080). Baseline: `npx playwright test --list` (352 tests on 2026-11-02), then `npm test`; note any failures before you start (the management axe test can time out under parallel load and passes alone).
- One step at a time, B1 to B11, in order. After each step: its new tests, then `npm test`, then show it in the browser pane and report to Hassan in 3 lines. Wait for his "next". Never commit or push unless he asks.
- **Stop points** (ask Hassan, never decide): any change to an existing test's assertion; anything that differs from the demo; a frame rate under 50 fps on the phone check (B10); any new download (name, source, licence, size first).
- **Hard rules** (V12 rules plus):
  - Colour literals only in `:root` of `css/style.css`.
  - No literal durations in CSS `transition` or `animation`; the test `S1: no literal durations` in `tests/motion.spec.js` checks this.
  - Every motion has a reduced-motion guard. Under `prefers-reduced-motion: reduce` every G spot is an opacity fade or nothing: no wind, no skull, no echoes, no blur, no fog pass.
  - Decoration is `aria-hidden="true"` and `pointer-events: none`. Clones (echoes, leaving cards) are also `inert`.
  - No motion lasts over 5 s (WCAG 2.2.2).
  - axe 0 violations. No sideways scroll at 320 and 375 px.
- Code goes in existing files: shared helpers in `js/login.js` (loaded on every page, next to `sound()` and `announce()`), page wiring in `js/index.js`, `js/customer.js` and `js/management.js`, CSS in `css/style.css` (shared) and `css/index.css` (landing). No new JS file and no dependency.
- Scope: the landing page (G1, G2, G5, G6), the customer and management drink lists (G3, G4), and the flags and page change on every page (G1, G5). The bartender page keeps its V12 card glide; G3 and G4 do not touch it.
- New tests go at the end of `tests/motion.spec.js`, named `G1: ...` to `G6: ...`. Default to `reducedMotion: 'reduce'` as V12 does, and opt in with `page.emulateMedia({ reducedMotion: 'no-preference' })`.

### Skills: when to invoke them

The `interfaces` plugin (installed 2026-11-02, user scope) adds review and workbench skills. Hassan types the slash commands, because those skills cannot be started by Claude. Claude loads the others itself at the step named.

| When | Who | Skill | What for |
| --- | --- | --- | --- |
| Any stop point with 2-3 visual options (B4 overlay 600 ms, B5 500 ms delay, B10 fps fixes, any demo mismatch) | Hassan | `/interfaces:variant` | The options go behind a picker in the real page, so the pick is made in the app, not on paper. |
| After B7, before B8 | Hassan | `/interfaces:break` on `#drink_database` | Stress the drink list under G3 and G4: 0, 1 and 200 drinks, long names, sold-out seals, 320 px, 200 % zoom, a tab switch mid-intro. Fix what breaks before B8. |
| B9 | Claude | `interfaces:better-accessibility` | Load it before the axe and screen-reader pass. It checks motion and zoom against WCAG 2.2, including 2.2.2 (motion over 5 s). |
| After B11, before Hassan asks for a commit | Hassan | `/interfaces:interface-review` | Reviews the uncommitted V12b change for interface regressions. Then run `/code-review` for correctness. |
| V13 (empty and error states), not V12b | Hassan | `/interfaces:state-machine`, then Claude loads `interfaces:better-writing` | Every empty and error state on one throwaway page with a switcher, then the copy for each. |

Do not take motion values from `interfaces:better-ui`. Its 150-200 ms ease-out timings conflict with the slower ghost motion picked here, and the demo stays the reference.

### B1. Tokens, the shared filter and `sound()` volume

1. In `:root` of `css/style.css`, after `--deal-dur`, add:
   - `--ghost-tint: sepia(1) hue-rotate(110deg) saturate(0.5) brightness(1.5);` (a filter, used only while a thing forms)
   - `--ghost-blur: 8px;`
   - `--ghost-form: 500ms;` (a card condensing)
   - `--ghost-open: 900ms;` and `--ghost-close: 400ms;` (dialogs, G6)
   - `--fog-pass: 1400ms;` (a bank of mist passing, G5 and G6)
   - `--page-out: 700ms;` and `--page-in: 900ms;` (G5)
   - `--bone: #b9b59c;` (the skull, G3)
2. `sound(name)` in `js/login.js` gets an optional volume: `function sound(name, volume)` with `cue.volume = volume || 0.6;`. Existing calls do not change.
3. Copy the picked cues from `docs/visual-options/audio/ghost/` to `audio/`, keeping their names: `paper-flap.mp3`, `creepy-long.mp3`, `creepy-tab.mp3`, `foghorn.mp3`, `ghost-whoosh.mp3`. Delete the unpicked `flag-flap.mp3`, `creepy-short.mp3` and `ai-whisper.mp3` from `docs/visual-options/audio/ghost/`. They are untracked, so ask Hassan first, as for any delete.
4. Update the "Sounds (V12b ghost motion, candidates)" section of `docs/ASSETS.md`: the five picked files now live in `audio/`. Remove the rows of the deleted files.

Tests: the token values (`getComputedStyle(document.documentElement)`); `sound()` with a volume (stub `HTMLMediaElement.prototype.play`, read `this.volume`).

### B2. G1: the wind along the flag cord

The V12 swing on press (`multilanguage.js`, search `classList.add("swing")`, and the `@keyframes swing` rule in `style.css`) is replaced by the spring. Its V12 test asserts the swing, so this is a **stop point**: show Hassan the test change before you make it.

1. In `js/login.js`, add the spring model from the demo (search `function addSprings` and `function step` in `v13-ghost.html`), unchanged in behaviour:
   - one record per item `{ el, a, v, push, max, k, c, f, sk }`
   - `pointerenter` and `focus` set `push = 1` and add `0.35 * 45` to each neighbour's `v`
   - `pointerleave` and `blur` set `push = 0`
   - one `requestAnimationFrame` loop runs while anything moves, and stops at rest (`|a|` and `|v|` under 0.05)
   - the transform is written to `el.style.transform`: `rotate(a deg) skewX(ripple deg)`
   - under reduced motion, `kick()` returns at once
2. Flags: items are `footer .languages_menu .languages` (the cloth, whose `transform-origin` is already `50% 0`). Feel `{ max: 6, k: 22, c: 3.5, f: 260, sk: 0.08 }`.
   - Check first that nothing else sets `transform` on `.languages`. The cord's sag uses the `rotate` and `translate` properties (V12 note), so `transform` is free.
3. Flags have no sound (G1 pick).
4. Remove the swing class code and its keyframes once Hassan has approved the test change.

Tests: hover a flag, wait 300 ms, and its `style.transform` has a rotation; its neighbour moves too; 3.5 s later both are at rest; under reduced motion nothing moves.

### B3. G2: the slips in the draught

1. Items: `#about` and `#passwords` on the landing page (`js/index.js`). Feels, in that order: About `{ max: 5, k: 14, c: 2.6, f: 330, sk: 0.03 }`, Passwords `{ max: 5, k: 26, c: 2.8, f: 190, sk: 0.14, flutter: 1 }` (the flutter term is in the demo's `step`).
2. Their `transform-origin` is `50% 10px` (the nail) and today they use `transform` for the hover drop. Remove the hover and focus `transform: translateY(4px)` and its transition (`css/index.css`, search `#about:hover, #about:focus-visible`). Keep the `.full_length` state that marks the open window. The slips also have a base `transform: rotate(-2deg)` / `rotate(1.5deg)`: move those to the `rotate` property so the spring's `transform` does not erase them.
3. On phones (`max-width: 768px`) the slips are the labelled bottom buttons (Mobile M5 B). There, run no wind: check `matchMedia("(max-width: 768px)")` when wiring.
4. Sound: on a gust start, `sound("paper-flap", 0.35)`, at most once every 2.5 s. Before the first click, `play()` is refused; that is expected.

Tests: as B2, plus the 2.5 s limit (stubbed `play` counts 1 for two quick hovers).

### B4. G6: the sheets form out of the mist

Today `openLogin()` and `closeLogin()` in `js/index.js` call `$('#loginBox').show()` and `.hide()`, and the About and Passwords windows toggle the `.hidden` class (visibility).

1. Make all three use the visibility pattern of `#summon img` (`css/index.css`): hidden = `opacity: 0; visibility: hidden; filter: var(--ghost-tint) blur(var(--ghost-blur)); scale: 1.03`, with `transition: opacity, filter, scale var(--ghost-close) var(--toast-ease), visibility 0s var(--ghost-close)`. Open = `opacity: 1; visibility: visible; filter: none; scale: 1`, with the same properties on `var(--ghost-open)` and `visibility 0s`.
   - The login box needs a class toggle in place of `.show()` and `.hide()`. Check the CSS for `display: none` on `#loginBox` and replace it.
   - Focus: `openLogin()` focuses `#user_name_input` right after opening. Visibility switches at 0 s on open, so the focus still lands. Test it.
2. The overlay (`#overlay`) fades in over 600 ms. Use `var(--toast-open)` plus `var(--lift-out)`, as `calc()`, or ask Hassan whether 600 ms becomes a token.
3. The mist puff: an `::after` on `#overlay` with the mist texture, animated `mist-pass` over `var(--fog-pass)` when it opens (the keyframes are in the demo).
4. Sound: `sound("ghost-whoosh", 0.7)` in `openLogin()` and in the About and Passwords open handlers. Opening is a click, so it plays.
5. Reduced motion: opacity only, no blur, no scale, no puff.

Tests: open the login, and 1 s later the box has opacity 1 and the input has focus; close it, and 0.5 s later it is hidden; same for About and Passwords; under reduced motion, no filter.

### B5. G5: the page change through the fog

1. In `css/style.css`: `@view-transition { navigation: auto; types: page; }`.
   - `css/bartender.css` turns the root crossfade off for its card glide (search `::view-transition-old(root), ::view-transition-new(root) { animation: none`).
   - Scope that rule to same-document transitions: in `animated()` (`js/bartender.js`) pass a type (`document.startViewTransition({ update: change, types: ["cards"] })`). Then select the bartender rule with `:active-view-transition-type(cards)` and the page fog with `:active-view-transition-type(page)`.
   - Check the bartender card glide still works afterwards.
2. Root keyframes under `:active-view-transition-type(page)`:
   - old: `breathe-out` over `var(--page-out)` ease-in (opacity 0, blur 3 px, scale 1.02)
   - new: `condense` over `var(--page-in)`, delayed 500 ms (from opacity 0 and `var(--ghost-tint) blur(3px)`). The 500 ms is `calc(var(--page-out) - 200ms)` or a token; ask Hassan.
3. The mist bank: a fixed, `aria-hidden` element added by `js/login.js`. It animates `mist-pass` over `var(--fog-pass)` only when the page arrived through a view transition: listen for `pagereveal` and check `e.viewTransition`. Firefox has no cross-document view transitions: it loads plainly and shows no mist.
4. The foghorn plays on the old page at the press. Add `function depart(url)` to `js/login.js`:
   - When `soundOn()`: `sound("foghorn", 0.8)`, then `setTimeout` 700 ms, then `location.href = url`.
   - Otherwise navigate at once.
   - `goToUserPage()` and `logOut()` call it.
   - `checkAccess()` redirects without it (no sound and no wait on an access-denied redirect). `goToUserPage()` is shared, so give it a second argument, or call `location.href` directly in `checkAccess()`.
5. Reduced motion: no transition (the `@view-transition` rule sits inside `@media (prefers-reduced-motion: no-preference)`), no mist. The foghorn still plays if Sound is on, because sound is not motion.

Tests: in Chromium, `document.startViewTransition` is not spied for navigation, so assert the CSS: the `@view-transition` rule exists, and the mist element animates after `pagereveal` (dispatch it). Log in with Sound on and a stubbed `play`: the foghorn is requested and the URL changes after 650 to 900 ms. With Sound off, it changes at once. The bartender glide test from V12 still passes.

### B6. G3: the skull of smoke on first load

Pages: customer and management, `#drink_database`, only on the page's first fill (`retrieveDB()` on load in `js/customer.js`; `retrieveSystembolaget()` on load in `js/management.js`). Never on a tab switch, a language change or a stock reprint.

1. The SVG filter `#smoke` from the demo goes into the page once. `js/login.js` appends a 0×0 `aria-hidden` `<svg>` holding it, only on these two pages. It contains:
   - the warp: turbulence 0.012 / 0.03, 3 octaves, displacement scale 60
   - the fog reveal: turbulence 0.03, 4 octaves, `feFuncA` slope 5
   - the grit: turbulence 0.8, `feFuncA` slope 6, intercept -3.2, composited `out`
2. The skull is a `div.skull` with an `::before` (CSS from the demo). The filter is on the parent and the masks are on `::before`, because CSS masks after filtering.
   - Fill: `var(--bone)` under the tarnish (multiply) and mist (screen) textures.
   - Move `docs/visual-options/skull.svg` to `img/skull.svg` (the assets test needs every `img/` file used by app code, so it waits until this step), update its row in `docs/ASSETS.md`, and point the demo at `../../img/skull.svg`.
   - Mask: `img/skull.svg` by luminance, intersected with `stamp-wear.webp` at 200×100 px.
   - `#drink_database` needs `position: relative`; check it does not break the scroll region.
3. The timeline (JS constants):
   - from 0 to 2 s, the reveal intercept rises from -4 to -0.1 (smoothstep), and the displacement falls from 60 to 16
   - it holds until 2.7 s
   - from 2.7 s to 4.1 s, the intercept falls back, the displacement grows to 136, and the skull drifts up 8 %, scales to 1.2 and fades
   - at 2.7 s the card wisps appear
   - at 3.1 s the cards condense (`ghost-in` over `var(--ghost-form)`, 40 ms apart, max 8 staggered), and the wisps blow away
4. **The cards are in the DOM from the start.** `printToDOM()` runs as today, so screen readers, keyboard focus and the existing tests are untouched. Hide them visually with `animation-fill-mode: backwards` and a 3.1 s delay. While the intro runs, give the list `pointer-events: none`, so no invisible card takes a click.
5. Skip: a `pointerdown` or `keydown` anywhere ends the intro at once. Remove the skull, finish the card animations (`getAnimations().forEach(a => a.finish())`), and restore pointer events. Keyboard focus moving into the list also ends it.
6. Sound: on that first press or key, if `soundOn()` and the skull is still on screen, play `creepy-long` (volume 0.8) from `currentTime = elapsed seconds`. Play nothing once the skull is gone.
7. Reduced motion: no skull, no wisps; the cards fade in over `var(--lift-out)`.

Tests: on load (no-preference), `.skull` exists and the cards have a running animation; 4.5 s later there is no `.skull` and every card has opacity 1; a key press at 1 s removes the skull at once; under reduced motion there is no `.skull`; the virtual screen reader reads the first card at once (cards in the DOM from the start).

### B7. G4: the spectral trail on a tab switch

1. Give each drink a stable id: `data-id="<article id>"` on the `.drink` button in `printToDOM()` (`js/customer.js`), and on the `.drink` row in `printToDOM()` (`js/management.js`).
2. Add `function ghostSwap(fill)` to `js/login.js`, ported from the demo's `show()` (option B, spectral trail):
   - Read the rect of every `#drink_database .drink` by `data-id`, inside the list's own coordinates. The list scrolls, so add `scrollTop`.
   - Leaving cards: absolutely placed clones (`aria-hidden`, `inert`) that run `vanish` for 700 ms.
   - Run `fill()`, which is the tab's existing empty-and-print.
   - Kept cards: echoes and a pale pass, in a wave from the top left (step `min(40, 600 / count)` ms):
     - three clones at their old place start at 0, 140 and 280 ms, at opacity 0.45, 0.3 and 0.18, rise 8, 16 and 24 px, and fade over 1.2, 1.1 and 1.0 s
     - the card itself goes to opacity 0.45 with `var(--ghost-tint) blur(2px)` at 45 % of 1.1 s, and glides from its old place if it moved (`cubic-bezier(0.45, 0, 0.2, 1)`)
   - New cards condense over 800 ms, 30 ms apart.
   - Remove the clones when they finish.
   - It must not block clicks: no view transition here.
3. Call it from every tab handler, with the handler's own empty-and-print as `fill`:
   - `js/customer.js`: `$(".all").click`, `$(".beers").click` and the other category handlers, which each run `highlightTab(...)` and `$("#drink_database").empty()`
   - `js/management.js`: `#drinks_list`, `#specials_db`, `#check_stock`, `#shortage_alert`
   - Not from `rePrintTab()`, `translate()` or the first load.
4. Sound: `sound("creepy-tab", 0.5)` once per switch.
5. Reduced motion: `fill()` runs, and the new cards fade over `var(--lift-out)`; no clones.
6. Many cards: the customer All list is long. Cap the echoes at the cards inside the list's visible area (plus one row). Cards out of view get no echoes, only the wave's pale pass.

Tests: switch All to Beers (no card moves): echo clones exist during the switch and are gone 2.5 s later; `.drink` count matches the filter; clicking a card during the switch adds it to the order (no blocked click); under reduced motion no clones; one `creepy-tab` request per switch (stubbed `play`).

### B8. Reduced motion, all spots

Go through every G spot with `reducedMotion: 'reduce'` and check:
- no element has a `filter` with `blur`
- no `.skull`, no clones, no mist element
- flags and slips never get a `style.transform`

Add one test per spot if B2 to B7 have not already done it.

### B9. Accessibility pass

- axe on the landing page (login, About and Passwords open), customer and management: 0 violations.
- The virtual screen reader: the login dialog is read as before; the first drink card is read at once on load; a tab switch reads no clone (clones are `aria-hidden` and `inert`).
- Keyboard: Tab through the flags. Focus starts the gust, and focus stays visible while the flag moves.

### B10. Phone and performance check

At 375 px in the `mobile` project, play G3 and G4 on the customer page. Measure the frame rate with a `requestAnimationFrame` counter over the intro and over one tab switch. Under 50 fps is a stop point. The likely fixes: fewer filter octaves, fewer echoes, or echoes only on cards in view. Ask Hassan which.

### B11. Docs

- `DESIGN.md`, Motion: a "Ghost motion (V12b)" part with the principle, the tokens from B1, and one line per G spot.
- `docs/ASSETS.md`: the skull and the five sounds point at their app paths.
- `docs/audit-baseline.md`: a "V12b done" entry with the test count and the axe result.
- This file: status "built", and anything that changed from the demo.
