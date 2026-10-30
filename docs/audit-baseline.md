# Audit Baseline (before polish)

Date: 2026-10-28. Branch `polish`, no code changes yet. Target: WCAG 2.2 AA.

Tools:
- axe-core 4.10.2 in the browser (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), viewport 1280x800, logged in with the `test` demo user.
- Impeccable 4.8.0 `detect` on all HTML and CSS.
- Manual keyboard test (Tab through each view) and code reading.

## Audit Health Score (Impeccable)

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 1 | Ordering, serving and stock actions cannot be done with a keyboard |
| 2 | Performance | 2 | Up to 196 drink images load at once, no lazy loading; hot-linked 9gag video |
| 3 | Theming | 1 | No CSS custom properties; 35 colours outside the documented palette |
| 4 | Responsive Design | 2 | Breakpoints exist, but the management order panel drops below the fold at 1280 px |
| 5 | Implementation Integrity | 2 | Feedback through `alert()`, "null" values shown, console error on load |
| **Total** | | **8/20** | **Poor (major overhaul of accessibility needed)** |

## axe-core violations

| View | Rules failed | Elements affected | Rules |
|------|-------------|-------------------|-------|
| index | 2 | 11 | image-alt (6), link-name (5) |
| customer | 6 | 116 | image-alt (87), color-contrast (13), link-name (7), listitem (7), list (1), scrollable-region-focusable (1) |
| bartender | 5 | 117 | image-alt (94), color-contrast (11), link-name (7), listitem (4), list (1) |
| management | 6 | 343 | image-alt (196), color-contrast (134), link-name (7), listitem (4), list (1), scrollable-region-focusable (1) |

"Needs review" (axe could not decide, mostly text over background images): customer 22, bartender 2, management 139.

## Findings by severity

### P0: blocks a task
1. **Keyboard users cannot order, serve or restock.** Drink cards (`.drink`), category tabs (`li` inside `<a>` with no `href`), remove buttons, Log Out and Place Order are `<div>`/`<li>` elements with click handlers. In management, Tab reaches only the five flags, undo, redo and Place Stock Order. WCAG 2.1.1, 4.1.2.
2. **Every drink image has no `alt`** (6 to 196 per view). Screen readers read file names such as "1132.png". WCAG 1.1.1.
3. **Rum Red buttons fail contrast:** black text on `#8e1f2c` is 2.4:1 (needs 4.5:1). Brass buttons are 3.8:1. Every view has Log Out. WCAG 1.4.3.

### P1: major barrier
4. **Language flags and undo/redo have no accessible name** (`link-name`, 7 per view). WCAG 2.4.4, 4.1.2.
5. **Feedback only through `alert()`:** login errors, order placed, payment and empty order. No `aria-live` region exists anywhere. The order total and the order list change silently. WCAG 4.1.3.
6. **Login form has no labels:** "User name" and "Password" are `<a><h2>` elements, not `<label for>`. Placeholder text is the only name. WCAG 1.3.1, 3.3.2.
7. **Drink list scroll area is not focusable** (`scrollable-region-focusable`), so keyboard users cannot scroll it. WCAG 2.1.1.
8. **No visible focus style.** The browser default ring is the only one, and it is often lost on dark wood. WCAG 2.4.7, 2.4.11.
9. **Bartender hover state:** white text on `#d6dddc` is 1.4:1.

### P2: quality and polish
10. **Broken list markup:** `<a>` elements placed directly inside `<ul>` (`list`, `listitem`). WCAG 1.3.1.
11. **No `prefers-reduced-motion` rule** anywhere. WCAG 2.3.3 (AAA) and good practice.
12. **`lang` never changes:** `<html lang="en">` stays English when Swedish, Italian or Spanish is chosen. WCAG 3.1.1.
13. **Data glitches visible to users:** "Volume: null" and "Cost per Liter: SEK null" in management; "Your credit is" shows no number for the test customer.
14. **Console error on index load:** `Cannot read properties of null (reading 'slice')` in `js/login.js:65`.
15. **Management layout:** at 1280x800 the order panel sits under the drink list, below the fold.
16. **Copy errors:** "Acces Denied" (login.js), "Välkommen til" should be "Välkommen till".
17. **Flat type hierarchy in management:** body, h1 and h2 render at the same 16 px.

## Not tested yet
- Screen reader walkthrough (VoiceOver or NVDA).
- Touch gestures on a real phone; the drag-and-drop Easter egg on touch.
- 200 % text zoom and 320 px reflow.

## Phase 2 decisions (2026-10-28)

- **Scope:** P0 and P1, findings 1 to 9.
- **Button text:** white labels on Rum Red and Brass. White on the current brass top (`#aa8139`) is only 3.55:1, so the brass gradient top darkens to `#926e30` (4.67:1). The bottom (`#84642b`, 5.47:1) and Rum Red (6.79 to 8.81:1) pass as they are.
- **Drink images:** `alt=""`. The image is decorative because the drink name sits beside it.
- **Feedback:** a transitions-dev toast plus one `aria-live` region replaces every `alert()`. Login errors also appear inline under the form.

## After Phase 2 (2026-10-28)

Same setup as the baseline: axe-core 4.10.2 from cdnjs, tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, viewport 1280x800, `test` demo login, `dutchman` launch config. Each view was scanned twice: at rest, and in use (an order built, undo pressed so undo and redo are both enabled, and a toast open). Index was also scanned with a login error showing.

| View | Rules failed (before → after) | Elements affected (before → after) | Needs review (before → after) |
|------|-------------------------------|------------------------------------|-------------------------------|
| index | 2 → 0 | 11 → 0 | 6 → 6 (10 with the login error showing) |
| customer | 6 → 0 | 116 → 0 | 22 → 6 (8 in use) |
| bartender | 5 → 0 | 117 → 0 | 2 → 2 |
| management | 6 → 0 | 343 → 0 | 139 → 10 |

Violations after each finding group (elements affected):

| View | Baseline | 1. Keyboard | 2. Names | 3. Contrast | 4. Feedback |
|------|----------|-------------|----------|-------------|-------------|
| index | 11 | 11 | 0 | 0 | 0 |
| customer | 116 | 106 | 12 | 0 | 0 |
| bartender | 117 | 113 | 11 | 0 | 0 |
| management | 343 | 337 | 134 | 0 | 0 |

The index pages were not converted in group 1, so its count only dropped in group 2. The +1 colour-contrast element on bartender after group 1 came from a test order (one more red "ORDER PAID" label), not from a regression.

### What the remaining "needs review" items are

axe cannot compute contrast for text over a background image or a gradient, so it reports these items for a person to check:
- White display text on the wood or storm photos (greetings, page titles, staff badge). This follows the DESIGN.md rule of Sail White on wood. It has the same limit as the 2018 version on the lightest planks.
- Brass and Rum Red gradient buttons. Checked by hand: white is 4.67:1 at the top of the brass gradient and 5.47:1 at the bottom, and 6.79:1 to 8.81:1 on Rum Red.
- Management drink details on the semi-transparent card. Black on about `#f6f8f8`, well above 4.5:1.

### Findings 1 to 9

1. **Keyboard:** fixed. Drinks, category tabs, remove, Log Out, Place Order, Cancel and Mark as Paid, Add +1/+10/+100, undo/redo, and the index launchers (Order your Drinks, staff logins, About, Get the passwords, close) are now native `<button>` elements. A full order and a full login were completed with the keyboard alone. The small-screen category menu also opens on keyboard focus.
2. **Drink images:** fixed with `alt=""`. The index logo is named in all 5 languages.
3. **Button contrast:** fixed with white labels; the brass top is now `#926e30`.
4. **Flags and undo/redo:** flags are named with their own-language names ("Svenska") and `lang`, and the active flag has `aria-current`. Undo and Redo are buttons named in 5 languages, with `aria-disabled` while faded. The word is visible from 1250 px up.
5. **Feedback:** fixed. All 10 `alert()` calls are replaced. There is one polite live region and one transitions-dev toast. Add, remove, undo and redo are announced with the new total.
6. **Login labels:** fixed with `<label for>`. Errors appear inline under the form, mark the wrong field `aria-invalid`, and shake it (no shake under reduced motion).
7. **Drink list scrolling:** the list is focusable and named as a region in 5 languages.
8. **Focus:** one two-tone ring (white outline plus black halo), at least 4.58:1 on any surface.
9. **Bartender hover:** fixed with Deep Kelp and a white label, 10.48:1.

### Fixed along the way
- P2 #10, broken list markup: fixed, because tabs are now `<li><button>`.
- Bartender accordion: each page click added another listener, so from the third click on, an order panel would not open. Replaced with one delegated handler that also sets `aria-expanded`.
- Bartender Cancel Order: the DOM traversal no longer matched once the buttons changed, so the code now uses `closest('.panel')`.
- Out-of-stock drinks are `disabled`, so the keyboard cannot order them either.
- Undo and redo ignore presses while faded. Before this, a keyboard press on an empty stack threw an error.
- Index now loads Font Awesome, which the error and toast icons need.

### P2 findings, closed before the Phase 2 commit
11. **Reduced motion:** the old About and Passwords slide-out and the bartender accordion are now still under `prefers-reduced-motion`. The toast and the login shake already were.
12. **`lang`:** `<html lang>` follows the chosen language (en, sv, it, es; Pirate uses en).
13. **Data glitches:** management leaves out Volume and Cost per Liter when the database has no value, instead of printing "null". The customer credit was in the data all along (400 for `test`): an inline `.welcome` box started 35% in, so the number wrapped below the header, which clips its overflow. The greeting is now one centred line.
14. **Console error on index:** `checkAccess()` no longer calls `.slice` on a missing id, and the user lookup stops when nobody is logged in. Index loads with no console errors.
15. **Management layout:** at 1024 px and up, the order column sits right of the drink list, as in the customer view. At 1280x800, Place Stock Order is at y 720 (was 1455). Below 1024 px it stacks as before.
16. **Copy:** "Välkommen till". "Acces Denied" was already replaced by the translated access-denied toast.
17. **Flat type hierarchy:** a detector false positive. The rendered sizes are title 32 px, "Your Order" 24 px and body 16 px; the static detector does not apply the CSS cascade. No change.

### Also closed
- **Place Stock Order** clears the order in place (no reload). Focus stays on the button, the open tab reprints with the new stock count, and the toast shows at once. The old `resetPage()` used the wrong variable (`total`) and a function management does not have (`copyStock`); both are fixed.
- **Accessibility-tree walkthrough** (in the browser, customer, bartender and index). Names, roles and states are correct, and hidden mobile duplicates are out of the tree. It found the customer greeting split into five headings ("Hello", "John", "!", "Your credit is", "400"); it is now one `h1` plus one line, with no visual change. It also found the English tab text "specials" in lowercase, now "Specials".
- **Pirate-flag drag:** checked with synthetic drag events. The drag carries `pirateFlag`, the drop swaps the logo for the video, and a second drop restores the logo.

### Still open
- A real screen-reader pass (NVDA or VoiceOver). The tree check does not cover speech order or how verbose each item is.
- A physical mouse drag of the pirate flag, and any test in Firefox or Safari.

## Automated screen-reader tests (2026-10-28)

The manual Orca pass is on hold: Orca crashed the whole desktop under Wayland. It is replaced by automated tests that follow `docs/orca-checklist.md`.

Setup: Playwright 1.64.1 drives the keyboard in Chromium and Firefox at 1280x800. The Guidepup Virtual Screen Reader 0.33.0 records what a screen reader would say. axe-core 4.10.2 runs in the same suite with the same tags as above. Run it with `npm test`; the dev-only packages live in `package.json`, and the tests are in `tests/`.

Result: 27 tests per browser. 20 pass in both browsers, including every axe scan (0 violations), tab states, live-region messages read once, out-of-stock drinks disabled, undo/redo states, Pirate announcements, and the login labels and error. 7 fail in both browsers. These are new findings, none of which axe can see:

| # | View | Finding |
|---|------|---------|
| 18 | index | The closed toast still catches clicks. At 1280x720 it covers the middle of "Order your Drinks!", so a mouse click there does nothing. |
| 19 | index | "About this project" and "Get the passwords" are read with a leading "<" ("less than"). |
| 20 | customer | The greeting is read as "HelloJohn!", with no space. |
| 21 | customer | After Remove, focus falls back to the page body, so keyboard users lose their place. |
| 22 | bartender | Cancel Order and Mark as Paid inside a collapsed order are still reachable with Tab and are read aloud. |
| 23 | bartender | Order rows are read with their separators: "ORDER #00020| Customer: … \| Date: …", and "::: ORDER PAID :::". |
| 24 | management | Every stock button is named only "Add +1", "Add +10" or "Add +100", so a listener cannot tell which drink it is for. |

Limits of the virtual screen reader: it follows the specifications, not a real screen reader's speech. It gives password fields no role and does not voice `aria-invalid`, so the tests check those attributes directly. A real screen-reader pass is still open (Orca under an X11 session, NVDA or VoiceOver).

### Findings 18 to 24, fixed (2026-10-28)

All 54 tests (27 per browser) now pass in Chromium and Firefox, axe included.

18. **Toast clicks:** the toast catches clicks only while it is open (`.toast.is-open`). Hover-to-pause still works.
19. **Stray "<":** the arrow sits in an `aria-hidden` span; the buttons look the same.
20. **Greeting:** the space now sits between the spans, so the heading is read as "Hello John!".
21. **Focus after Remove:** focus moves to the next Remove button, then the previous one, then Place Order when the order is empty. Management uses the same rule.
22. **Collapsed orders:** a closed panel is `visibility: hidden`, so its buttons leave the Tab order. The panel becomes visible at once when it opens, and stays visible until the 0.2 s close slide ends.
23. **Separators:** the `|` and `:::` marks are `aria-hidden`; nothing changes on screen.
24. **Stock buttons:** each Add button is named by `aria-labelledby`, its own word plus the drink name ("Add +1 Braastad XO"), so the word stays translated in all 5 languages.

## Mobile baseline (before, 2026-10-28)

Tools: Playwright 1.64.1 with Chromium, logged in as `test`, plus axe-core 4.10.2 with the same tags as above. Touch emulation (`isMobile`, `hasTouch`, 2x) at 375x812 and 320x640. "200% zoom" is 1280x800 browser zoom, which is a 640x400 CSS-px viewport at 2x. Target size is every visible link, button, input and `.drink` below 24x24 CSS px (WCAG 2.5.8). Screenshots at 375 px are in `docs/mobile-before/` (`<view>-375.png`, `-full.png`, and `flow-*.png` for the touch walk-through).

### Scan results

| Viewport | View | axe violations | Horizontal scroll | Clipped content | Targets under 24 px |
|----------|------|----------------|-------------------|-----------------|---------------------|
| 375 | index | 0 | none | About and Passwords tabs: label cut off, only "<" shows | login close "X" 14x18 (when the login box is open) |
| 375 | customer | 0 | none | none | remove "X" 20x24 (when the order panel is open) |
| 375 | bartender | 0 | none | tab row 399 px wide in a 359 px box; order text cut in 20 of 20 rows | none |
| 375 | management | 0 | page is 980 px wide, shown at 0.38x | text is 6 px on screen | see "Management at 375" below |
| 320 | index, customer | 0 | none | as 375 | as 375 |
| 320 | bartender | 0 | none | tab row 344 px in a 304 px box; order text cut | none |
| 320 | management | 0 | page is 980 px wide | as 375 | as 375 |
| 640 (200% zoom) | index | 0 | none | About and Passwords tabs cut | "Bartender login" 76.9x21 |
| 640 | customer | 0 | none | none | none |
| 640 | bartender | 0 | none | tab row 664 px in a 624 px box; order text cut in 20 of 20 rows | none |
| 640 | management | 0 | none | four drink cards: 428 px of content in a 407 px box | remove "X" 20x24 |

Management at 375 (measured as seen on screen, layout scaled by 375/980 = 0.383): tabs 49x14, Add +1/+10/+100 42x29, flags 33x21, undo and redo 10x12. In CSS px they pass, but a finger gets the scaled size.

axe finds nothing at any size (its `target-size` rule is in the `wcag22aa` tag and did not fire). The problems below are layout and touch problems that axe cannot judge.

### Touch walk-through at 375 (customer, then staff)

- Category menu: the 7 tabs are hidden below 769 px and a hamburger shows. A tap on it opens the list (it opens on `:hover` or `:focus-within`, and a touch tap triggers both). It does not close after picking a category, and a second tap on the hamburger does not close it. It closes only when you tap outside, such as on the thin strip of wood at the edge. Open, it covers about 70% of the drink list (257x524 px). Not tested on iOS Safari, which does not focus buttons on tap and may not open it at all.
- Adding a drink works by tap. The order list is hidden: only "Total" shows. You open it by tapping the Total bar, which is a `div` with an `onclick` (not a button, no name, not reachable by keyboard). It opens as a 341x220 px box over the top of the drink list and shows 3 items.
- Undo and redo are `display: none` below 769 px, so a phone user cannot undo.
- Place Order and the success toast work by tap.
- Staff: Bartender login and Management login are `display: none` at 414 px and below. A phone visitor cannot start two of the three roles. (The test script clicked them through JavaScript to measure the views.)
- Bartender: each order row has a fixed 70 px height, which cuts the text in all 20 rows (customer, total, "ORDER PAID" are lost). Opening a row by tap works. Cancel Order and Mark as Paid are 56x48.
- Management: tapping Add +1 works, but see the scale problem below.
- Login box (index): inputs use 13.3 px text, which makes iOS zoom in on focus. The close "X" is 14x18 with 9 px text.

### Findings, grouped

M1. **Management has no `<meta name="viewport">`.** Phones lay it out at 980 px and shrink it to 0.383x, so text is about 6 px and buttons are 42x29 or smaller on screen. WCAG 1.4.4, 1.4.10, 2.5.8 (effective size). Only management.html is missing it.
M2. **Staff logins are hidden on phones.** `button.margin_button { display: none }` at 414 px and below (css/index.css:407). A reviewer on a phone cannot try the bartender or manager role, which breaks product principle 4. The bartender view also fails M4, so the question is whether to show the logins and fix both views, or keep staff for larger screens and say so.
M3. **Customer order flow by touch.** (a) The category menu stays open after a choice and cannot be closed by its own button. (b) The order list opens only from a non-button `div`, with no name or state, no keyboard use, and a short panel that overlays the drink list. (c) Undo and redo are missing on phones. (d) Remove "X" is 20x24 (fails width by 4 px; the 70 px gap between items means it likely passes the 2.5.8 spacing exemption, but the fix is cheap).
M4. **Bartender at phone width.** Fixed 70 px order rows cut the text. The tab row is wider than its box and gets clipped. Footer: flags stack in a column, "Log Out" wraps to two lines.
M5. **Landing page at phone width.** About and Passwords show only "<" with the label cut off. The login close "X" is 14x18 and its text is 9 px. Input text is 13.3 px. "Bartender login" is 21 px tall at 640 px. The login box is sized in percent and "xx-small" text.
M6. **Management layout once it has a viewport.** Drink cards overflow by 21 px at 640 px, the order panel is a half-width empty box at 375, and "Your Order" sits under the full list. This group becomes visible only after M1 is fixed, so it is measured again after that fix.

Not yet tested: a real phone, iOS Safari, and the pirate-flag drag on touch.

## After mobile (2026-10-29)

Same tools and viewports as the baseline (Chromium, touch emulation, axe-core 4.10.2 with the same tags; 640 px is 200% text zoom at 1280). At-rest screenshots at 375 px are in `docs/mobile-after/`, with per-fix shots in `docs/mobile-after-*.png`.

| Check | Before | After |
|-------|--------|-------|
| axe violations, 4 views x 3 viewports | 0 | 0 |
| Horizontal scroll | management: 980 px page at 0.38x on phones | none at 320, 375 and 640 px |
| Clipped content | bartender rows 20/20, tab row 399 px in 359 px, About/Passwords labels, management cards at 640 px | none |
| Targets under 24 px at rest | login X 14x18, remove X 20x24, "Bartender login" 76.9x21 | none |
| Touch controls | 44 px or more on the new phone controls (category rows, order toggle, undo/redo, remove, Add, footer, About/Passwords, login X) | |
| Mobile tests | none | 5 in project `mobile` (375x812, touch); fail on the old code, pass now |
| `npm test` | 54 | 59 passed |

### Fixes by group

- **M1, management viewport.** `<meta name="viewport">` added. Below 768 px the 2018 floats stack: tabs 2x2, card = image and details, stock, three 80x54 Add buttons.
- **M2, staff logins.** Decision: stay hidden at 414 px and below, no hint text. Where they show (415 to 767 px, 200% zoom) they hug their label and are 46 px high (was 21).
- **M3, customer touch flow.** The category menu is a real toggle (`aria-expanded`, closes on pick, Escape or an outside tap, rows 44 px). The order list opens from a real `<button id="order_toggle">` named by the existing "Your Order" text (all 5 languages already there). Undo and redo show on phones as 44 px icons in the top row. Remove X is 44x44 on phones and 24 px minimum everywhere.
- **M4, bartender.** Rows wrap (no fixed height), tabs 2x2, footer in two rows (Log Out and undo/redo, then the flags). Tab row no longer overflows.
- **M5, landing page.** About and Passwords are labelled 44 px buttons at the bottom (white on `#8e1f2c` 8.81:1, white on `#1e6b2b` 6.58:1; the 50% red and green fills measured 4.29:1 and 1.61:1). The windows are opaque, near full-width sheets with 44 px close buttons. The login box fits the screen, inputs use 16 px text, and its close X is 54x48.
- **M6, management below 1024 px.** Order panel capped at 28vh and the list at 46vh. Place Stock Order moved from y=1785 to y=1065 at 375 px. Footer wraps in rows with 44 px buttons and one row of flags.

New labels: none. Every accessible name reuses existing text, so no new translation was needed.

### Still open

- A real phone and iOS Safari. Playwright emulates touch but does not reproduce Safari's focus-on-tap behaviour.
- The pirate-flag drag on touch.
- About window text in the other 4 languages at 375 px (layout is width-based, not checked per language).
- Bartender tab row at 1280 px is 40 px wider than its box (default `ul` padding, predates this work, clips nothing visible).
- Desktop remove X and the desktop About/Passwords slide-out tabs keep their 2018 sizes at 1280 px.

## Theming baseline (before, 2026-10-29)

Colour literals (hex, rgb, rgba) per file. Only `:root` use today is motion tokens in style.css.

| File | Colour literals | `var(--)` colour uses |
|---|---|---|
| css/style.css | 40 | 0 |
| css/customer.css | 32 | 0 |
| css/index.css | 28 | 0 |
| css/management.css | 24 | 0 |
| css/bartender.css | 19 | 0 |
| js/*.js hex in `.css(...)` calls | 14 lines | 0 |
| inline `style=` in html | 3 (white text, bold) | 0 |

Total 143 CSS literals, 45 distinct (plus 14 JS lines). Top: `#a4b9b6` x14 (sea glass), `#254540` x13 (kelp), `#fff` x9, `#c0cfcc` x9, `#96b9a5` x8, `#567973` x7, `#0c2924` x7.

## After theming (2026-10-29)

Hassan chose: A semantic tokens, T7 (JS colours) in, merge near-twin `#0a2521` (it had no live use, only comments), delete 6 dead classes, style active tab from `aria-pressed`.

| Measure | Before | After |
|---|---|---|
| Colour literals in CSS outside `:root` | 143 | 0 |
| Colour `var(--)` uses in CSS | 0 | 184 |
| Colour tokens (in `:root` of css/style.css) | 0 | 42 (45 distinct colours before, dead ones dropped) |
| Hex colours in `.css()` calls in JS | 14 lines | 0 (tab highlight lines deleted, `has-new` class for new orders, `var()` for the index gag background) |
| Inline `color:white` in HTML | 2 | 0 (`var(--ink-on-dark)`) |
| Dead classes removed (style.css) | 6 (`.fade2 .orange .grey .yellow .beek .light_orange`) | 0 |
| Named colours (`white`, `black`, `red`, `green`, `grey`, `whitesmoke`, `lightgrey`, `darkgray`) | not counted in baseline above | 0 |

The baseline count above missed named colours; they are now tokens too.

Verification: computed colour, background, border, outline and shadow of every element, old commit vs new, in 4 views, 25 states (tab clicks, About and Passwords panels, new-order alert), at 1280 and 375 px. Identical except one intended change below.

Intended change: customer category list (hamburger) separators. Old code coloured a dropdown item's border green-grey only after it had been the active tab, so separators vanished item by item. Now all items keep the same black separator.

Tests: `tests/theme.spec.js` fails if a colour literal appears outside `:root` or in a JS `.css()` call, and proves the active tab follows `--surface`. `npm test` = 63 tests. One full parallel run: 62 passed, plus the management axe test failed (suspected 60 s timeout under load, it takes 20-50 s); it passes alone and passed in an earlier full run (59 passed + 4 new theme tests).

Still open: a dark or high-contrast theme (only one place to edit now, but each colour pairing needs a contrast check); `.dropdown-content` and a few 2018 shadow colours keep their original values.

## Visual baseline (before, 2026-10-29)

Tools: Playwright 1.64.1 with Chromium at 1280x800 and 375x812 (touch), logged in as `test`. A script read the computed style of every visible element (font size, family and weight on text nodes, padding, margin, radius, shadow, transition, background image) and every image and video source. Screenshots are in `docs/visual-before/`: each view at rest and full page, plus states (login, login error, About, Passwords, Easter egg, empty order, empty-order error, built order, open bartender order).

### Inventory

| Measure | Value |
|---|---|
| Font sizes in use | 6 (12.8, 15, 16, 20, 24, 32 px); no scale or tokens |
| Font families | Oswald, Berkshire Swash, plus Consolas on the desktop About/Passwords tabs |
| Bold body text | 700 on 2487 of 2878 text elements in management, 171 of 194 in customer |
| Distinct padding values | 19 (2 to 40 px, many fractional from percentages) |
| Distinct margin values | 606 (percent margins resolve to a new value per box) |
| Distinct border radii | 13, including 0.5 %, 1 %, 3 % and 4 % |
| Shadow recipes | 6, all pure black or black at 20 to 35 % |
| Wood textures | 4 different files: `wood.jpg` (management), `wood2.jpg` (customer), `wood4.jpg` (bartender), `wood3.jpg` (login box) |
| Interaction states in CSS | 17 `:hover`, 1 `:active` (links), none on drink cards or Add buttons |
| Motion | toast and login shake use transitions-dev tokens; bartender `transition: 0.4s` (all, ease) and index `appear` 500 ms keyframes do not |
| Icons | Font Awesome 4.7 (bars, undo, repeat, check-circle, exclamation-circle); close and remove are the letter "X" |
| External media | 3 hot-linked 9gag URLs (Easter-egg poster, mp4, webm) |
| Unused image files | 7 (`ita.svg`, `logo.png`, 5 logo variants) |
| Drink images | 213 files, 47 MB; largest 6.2 MB; no `loading="lazy"`, so management loads 191 at once |
| Flag images | 1200x750 PNGs shown at 70x40; Spanish flag 112 KB |
| Asset licences recorded | none; `storm.jpg` carries a visible artist signature ("Ernest T.", bottom right) |
| axe at 1280 and 375 | 0 violations (unchanged since Phase 2) |

### Findings, grouped

V1. **Type and spacing scale.** Six font sizes chosen per rule, almost all body text bold, so nothing stands out. Spacing is percentages, which gives 606 margin values and uneven gaps that shift with width. Google Fonts load without `display=swap`.
V2. **Materials and shadows.** Four wood textures across four screens, so the tavern changes floor per view. Six black shadow recipes and 13 radii, some in percent, so corners bend differently per box.
V3. **Drink cards.** Customer: at 1280 the grid fits 3 cards and leaves 168 px empty on the right (cards 202 px, gaps 34 px); the name jumps up when "LOW STOCK!" shows; no hover or press state; out of stock is only grey text. Management: about 300 px tall near-white cards with flat square brass Add buttons, and "Current Stock" floats mid-card.
V4. **Tabs, buttons and states.** Footer buttons have a thick white border. "Log In!" is the browser-default grey button. Close is a grey "X" square. At 1280 the About and Passwords side tabs are cut to "<" and use Consolas. No pressed state anywhere; faded undo/redo only drop to 50 % opacity.
V5. **Order panel.** Empty, it is a blank 350 px box with no hint. Rows squeeze the bottle image, the remove X is an orange square in the corner, and row gaps are uneven. The total reads "SEK 0 :-".
V6. **Header and footer.** The staff badge is clipped ("Bartender: Bart", "Manager: Mana") and sits in a grey box over the title. At 375 the customer greeting and credit are not shown. Footer flags are raw photos with uneven spacing.
V7. **Landing page.** Staff logins are small, top left. The About and Passwords windows are 50 % red and green, so the logo and "Order your Drinks!" show through. The login box mixes a fourth wood, browser-default inputs and button. A toast can sit on top of an open window.
V8. **Demo-logins panel.** Eight accounts as bullet pairs ("username: / password:"), with no grouping by role beyond headings and no way to fill the form from the list.
V9. **Easter egg.** Dropping the pirate flag shows a hot-linked 9gag video of a dancing duck on flat green. Not pirate, not ours to host, and it breaks if 9gag moves the file.
V10. **Assets.** No licence is recorded for the storm, wood, pirate flag or logo. 7 unused files, 47 MB of drink images, none lazy-loaded.
V11. **Icons.** Font Awesome 4.7 from 2017, with "repeat" standing in for redo, and the letter "X" for close and remove.
V12. **Micro-motion.** Only the toast, login shake and accordion move. Adding a drink, switching tabs and pressing buttons give no motion feedback. Two animations sit outside the transitions-dev tokens.
V13. **Empty and error states.** Empty order: blank 350 px panel, then an error toast on Place Order. Empty tabs (for example an empty Specials list or bartender queue) are not checked yet; they are measured when this group starts.

### V1 done (2026-10-29): type and spacing scale

Hassan chose A (1.25 ratio, 4 px spacing steps) and to move percent spacing to the tokens group by group (V3 to V7), not all at once. Mockup: `docs/visual-options/v1-type.png`.

- **Fonts:** the old Google Fonts link delivered only weight 400, so every bold was faked by the browser. Now `css2?family=Berkshire+Swash&family=Oswald:wght@400..700&display=swap` on all 4 pages, and `font-synthesis: none` on `body`, so no weight is ever faked. The swash greeting is set at its real 400.
- **Tokens in `:root` (css/style.css):** `--text-xs` 12.8, `--text-base` 16, `--text-md` 20, `--text-lg` 25, `--text-xl` 31.25 px, `--text-display` clamp 31.25 to 39 px (rem, so it grows with zoom); `--weight-body` 400, `--weight-label` 500, `--weight-heading` 600; `--space-1` to `--space-7` = 4, 8, 12, 16, 24, 32, 48 px (used from V3 on).
- **Applied:** all 27 `font-size` rules and 6 `font-weight` rules now use tokens. Headings h1 to h4 get their size from the scale. Labels (`<b>`) and prices are 600, drink names and Add buttons 500, body 400. The staff badge's inline `font-weight:bold` is now a `<b>`. The desktop About/Passwords tabs use Oswald instead of Consolas. The order total is 20 px from 769 px up and stays 16 px in the phone checkout bar.

| Measure | Before | After |
|---|---|---|
| Font sizes in use (all views) | 6, in px, em, %, rem and `xx-small` | 6, all from 6 tokens |
| Faked bold | every bold (only 400 loaded) | none (`font-synthesis: none`, variable 400 to 700) |
| Bold (600+) text elements, management | 2487 of 2878 | 1914 at 600, 573 at 500, 391 at 400 |
| Bold (600+) text elements, customer 1280 | 171 of 194 | 96 (prices, labels, headings) |
| Font families | 3 (Consolas on 2 tabs) | 2 |
| Fonts visible before load | no (`display=block` default) | yes (`display=swap`) |
| Horizontal scroll at 320, 375, 640 (200% zoom) | none | none |
| axe | 0 | 0 |
| `npm test` | 63 | 67 (66 in one parallel run plus the known management axe timeout; it passes alone) |

Tests added in `tests/theme.spec.js`: every `font-size` and `font-weight` in the CSS is a token, no inline bold in the HTML, Oswald loads as one 400 to 700 face, and `font-synthesis-weight` is `none`. Both fail on the old code.

New finding while checking 200% zoom (not caused by V1, same on the old code): at 641 to 768 px wide (1280 at 200% zoom) the customer drink cards show no name or price. The `h4, .drink .h4` rule in the 768 px media query of css/customer.css has `margin-top: 20%`, which is 109 px at that width and pushes the text below the 73 px card, whose overflow is hidden. WCAG 1.4.4 and 1.4.10. It belongs to V3 (drink cards), where that percent margin moves to the spacing tokens.

### V2 done (2026-10-29): materials and shadows

Hassan chose wood A (wood2 with a 45 % dark scrim on all working views) and a shadow strength between the soft and the heavy option: M2, two layers of 65 % black. Mockups: `docs/visual-options/v2-wood.png`, `v2-materials.png`, `v2-shadows.png`.

New WCAG finding before the fix: axe cannot measure text on a background image, so the wood was sampled per pixel (200x150 grid). On bare wood2, Sail White fell to 2.82:1 on the brightest 5 % of planks, and the credit line (`--ink-soft-on-dark`, #96b9a5) was 2.92:1 at the median and 1.31:1 on bright planks. Fails 1.4.3.

- **Tokens in `:root` (css/style.css):** colours `--shadow-lift` rgba(0,0,0,.65) and `--wood-scrim` rgba(0,0,0,.45); `--wood` (scrim gradient over wood2), `--shadow-raised` (0 2px 6px, 0 10px 26px), `--shadow-float` (0 2px 6px, 0 12px 28px), `--radius-sm` 4 px, `--radius-md` 8 px, `--radius-round` 50 %. Removed the now unused `--shadow-soft`, `--shadow-pop` and `--glow`.
- **Applied:** customer, bartender and management use `background-image: var(--wood)`. Every panel on the wood gets `--shadow-raised` (customer and management drink list, order header, order list and checkout; bartender order queue); tabs too. Buttons, the category menu, the toast and the landing buttons get `--shadow-float`. Footer buttons lose their white border. All corners use the radius tokens. The credit line is Sail White, as DESIGN.md requires for text on wood.
- **Left for later:** the login box still uses `wood3.jpg` (V7 landing). `wood.jpg` and `wood4.jpg` are now unused (V10 assets).

| Measure | Before | After |
|---|---|---|
| Wood textures under working views | 3 (wood, wood2, wood4) | 1 (wood2 + scrim) |
| Sail White on the wood, brightest pixel | 2.82:1 at the 95th percentile (wood2) | 5.48:1 or better on every pixel |
| Credit line on the wood | 1.31:1 (bright planks) to 2.92:1 (median) | Sail White, 5.48:1 or better |
| Shadow recipes | 6 | 2 tokens, plus the focus ring |
| Radius values | 13, 6 in percent | 3 tokens (4 px, 8 px, 50 %) |
| Customer panels with a shadow | tabs only | tabs, drink list, order header, order list, checkout |
| Horizontal scroll at 320, 375, 640 (200% zoom) | none | none |
| axe | 0 | 0 |
| `npm test` | 67 | 75, all green in one parallel run |

Tests added in `tests/theme.spec.js`: every `border-radius` and `box-shadow` in the CSS is a token (the focus ring excepted); each working view's body shows the scrimmed wood2; and every visible text that sits directly on the wood is Sail White. All fail on the old view CSS.

### V10 done (2026-10-29): assets

Hassan chose drinks A (WebP, 400 px tall, quality 82, plus native lazy loading), licences B (record only, replace nothing) and to delete every unused file. Mockup: `docs/visual-options/v10-drinks.png`.

- **Drink images:** the 213 PNGs (up to 1532x4002 px, 6.3 MB for one bottle) became WebP at 400 px tall at most, which is twice the largest card image (184 px). The 5 templates in `js/customer.js`, `js/management.js` and `js/bartender.js` now point to `.webp` and set `loading="lazy"`. `js/management.js` keeps its CRLF endings.
- **Deleted, unused:** `ita.svg`, `logo.png`, `basket.png` (with its commented-out `<img>` and its `.shopping_basket` CSS), `wood.jpg`, `wood4.jpg` (unused since V2), 5 logo variants in `img/logo/`, and 6 drink files that no database entry names (`508116 .png` with a space in its name, `brooklyn`, `brooklyn_orange`, `corona`, `heineken`, `1024702`; the last one matched only a `nr` field, not an article id). All remain in git history.
- **Sources and licences:** new `docs/ASSETS.md` lists every image, font and library with its known source and licence. No source was recorded in 2018 and the image files carry none, so storm, wood2, wood3, the flag files and the pirate flag are marked "unknown, not cleared"; the drink photos as third-party product photos (Systembolaget article numbers), not free, used only in this non-commercial demo; the logo and favicon as the 2018 team's own work. The README image list now matches the folder and points to it.
- **Left for later:** the 9gag hot-link (V9). The flags are still 1200x750 PNGs shown at 70x40, and the landing page still loads 3.0 MB (storm, flags, logo): V7 and V11.

| Measure | Before | After |
|---|---|---|
| Drink image files | 213 PNG, 48.5 MB | 207 WebP, 2.5 MB; largest 39 KB |
| First load, customer (1280) | 22.2 MB, 82 drink requests | 1.3 MB, 30 drink requests |
| First load, management | 45.4 MB, 191 drink requests | 1.2 MB, 11 drink requests |
| First load, bartender | 8.9 MB | 1.0 MB |
| Unused files in `img/` | 16, about 5.9 MB | 0 |
| Assets with a recorded source and licence | 0 | all, in `docs/ASSETS.md` (several honestly "unknown") |
| Broken images after scrolling every view | 0 | 0 |
| Horizontal scroll at 320, 375, 640 (200% zoom) | none | none |
| `npm test` | 75 | 81 (80 in one parallel run plus the known management axe timeout; it passes alone) |

Tests added in `tests/assets.spec.js`: every image outside `img/drinks` is used by the code and listed in `docs/ASSETS.md`; there is exactly one WebP under 60 KB per drink in the database and no orphan; and the customer view marks every drink image lazy and loads fewer than half of them at first. All fail on the old files.

### V11 done (2026-10-29): icons

Hassan chose icons A (Lucide SVG sprite), with one change: the order-row remove buttons show a trash can, so the icon says "remove this from the order" rather than "close". Dialog close buttons on the landing page use `x`. Flags A: true ratio. Mockups: `docs/visual-options/v11-icons.png`, `docs/visual-options/v11-flags.png`.

- **Icon set:** Font Awesome 4.7 (cdnjs CSS plus a 77 KB font, on all 4 pages for 5 glyphs) is gone. One local sprite, `img/icons.svg`, holds 7 Lucide symbols (ISC): `menu`, `undo`, `redo`, `trash`, `x`, `check`, `alert`. Markup is `<svg class="icon" aria-hidden="true"><use href="img/icons.svg#name"/></svg>`; `.icon` in `css/style.css` draws 2 px round strokes in `currentColor`, and `.icon-2x` doubles the size. The toast swaps its symbol (`check` or `alert`) in `js/login.js`.
- **Letter icons:** the 6 text "X" buttons became icons: `trash` on the order rows (`js/customer.js`, `js/management.js` twice, CRLF kept) and `x` on the 3 landing dialogs. Their accessible names did not change (`aria-labelledby` and `aria-label`), so no new strings were needed in the 5 languages.
- **Flags:** the 5 files (1200x750, 260 KB) became 128x80 WebP (7.3 KB), twice their display size. They are drawn at 64x40 (56x35 on phone footers), the true 1.6:1 ratio instead of the stretched 70x40, with 4 px corners and the Float shadow.
- **Left for later (V7):** on the landing page between 641 and about 1000 px, the flags wrap to two rows. This is the same with the old CSS.

| Measure | Before | After |
|---|---|---|
| Icon requests per page | 2 to cdnjs (7 KB CSS gzip + 77 KB font) | 1 local sprite (968 bytes) |
| Letter "X" used as an icon | 6 buttons | 0 |
| Flag files | 1200x750, 260 KB | 128x80 WebP, 7.3 KB |
| Flag ratio as drawn (file is 1.6) | 1.75 at desktop, 1.65 on phone footers | 1.6 at every width |
| First load, landing / customer / bartender / management | 3.0 / 1.3 / 1.0 / 1.2 MB | 2.6 / 1.0 / 0.8 / 0.9 MB |
| Third-party hosts on the working views | 4 (cdnjs, Google Fonts x2, Google jQuery) | 3 |
| Flags on one row, no horizontal scroll at 320 and 375 | yes | yes |
| `npm test` | 81 | 85 (84 in one parallel run plus the known management axe timeout; it passes alone) |

Tests added in `tests/assets.spec.js`: no page loads an icon font or uses a letter as an icon, and every `icons.svg#name` in the code exists in the sprite; on the customer view the sprite loads, an order row's remove button shows `trash`, and every flag is drawn and stored at 1.6:1. All fail on the old code.

### V3 done (2026-10-29): drink cards

Hassan chose customer A (shelf grid), management A (compact grid row) and to translate the stock text in V3. Mockups: `docs/visual-options/v3-customer.png`, `docs/visual-options/v3-management.png`.

- **Customer shelf:** `#drink_database` is a CSS grid, `repeat(auto-fill, minmax(160px, 1fr))` (140 px under 769 px), with `--space-4` gaps (`--space-3` on phones) and `grid-auto-rows: max-content`. Each card is a 3-row grid: name (at least two lines), bottle (160 px, 112 on phones), price. The old fixed 170x335 float, percent margins and the phone `button.drink` rules are gone.
- **641 to 768 px bug fixed:** the phone rule `h4, .drink .h4 { margin-top: 20% }` no longer reaches the drink cards (`.drink .h4` removed from it), so names and prices stay inside the card at every width. The rule still applies to plain `h4` elements as before.
- **States:** hover lifts the card 2 px with the Float shadow (new motion tokens `--lift-distance`, `--lift-in` 150 ms, `--lift-out` 250 ms; none under reduced motion); pressing drops it back. Low and out of stock are small badges under the price (white on Rum Red 6.22:1, on Deep Kelp 10.48:1). An out-of-stock card keeps full opacity, greys its bottle and stays disabled.
- **Stock text translated:** "LOW STOCK!" and "OUT OF STOCK" were hard-coded English. They are now `low_stock` and `out_stock` in `js/view/view_customer.js` (5 languages), printed with the existing `lang()` and switched in `translate()`.
- **Management card:** one grid row, `112px | details | 128px | 112px`, on Pale Sea Glass instead of near-white: bottle, details, the stock number (31 px) under a small black uppercase label, and three stacked brass Add buttons with 4 px corners and the Float shadow. Phones: bottle beside details, then the stock line and the Add buttons side by side at 44 px. The three `<br>` spacers are gone. Zero stock in Muted Copper is now 3.68:1 on the card, which passes only as large text (31 px number); the label stays black (13.04:1).
- **Found and fixed:** on a non-English first load, the management card labels ("Name:", "Current Stock", "Add +1", and the rest) stayed English until a flag was clicked, because the cards are printed after `setLanguage()` runs. The template now prints each label with `lang()`.
- **Fixed after V3:** clicking a flag in management replaced the price in every order row with the word "Price:" (for example "SEK 442:-" became "Pris:"). `translate()` in `js/management.js` set `$(".price").text(...)`, and the order rows' `<h4 class="price">` share that class with the card label. The selector is now `$(".drink .price")`. Test: "management language switch keeps order-row prices" in `tests/cards.spec.js` (fails on the old code).

| Measure | Before | After |
|---|---|---|
| Customer cards per row at 1280 | 3 (202 px), 168 px empty | 4 (195 px), none empty |
| Customer cards on a 375 phone | 1 per row, 330x143 | 2 per row, 154x256 |
| Card name and price inside the card at 641-768 px | no (pushed 109 px down) | yes, at every width 320 to 1280 |
| Card height changes when a stock badge shows | yes (name moves up) | no (equal heights per row) |
| Stock text in the 5 languages | English only | all 5 |
| Management card height at 1280 / 375 | 304 / 359-383 px | 224 / 331-379 px |
| Management card labels on a Swedish first load | English | Swedish |
| First load, customer / management | 1.0 / 0.9 MB | 1.1 / 1.0 MB (more cards sit inside the lazy-load margin) |
| `npm test` | 85 | 103, all green in one full run (management axe included) |

Tests added in `tests/cards.spec.js`: at 1280, 768, 700, 641, 375 and 320 px every card's name and price sit inside the card with no horizontal scroll; the shelf has 4 equal-height columns at 1280 and 2 at 375; stock badges read "Slut i lager" in Swedish and "Agotado" after clicking the Spanish flag, and an out-of-stock bottle is greyscale; management cards are at most 240 px tall and print Swedish labels on a Swedish first load. Changed: the screen-reader test now expects "Out of stock", and the lazy-load test allows up to 60% of drink images (was 50%). The rest fail on the old code.

### V4 done (2026-10-30): tabs, buttons and states

Hassan's choices, over nine mockup rounds (`docs/visual-options/v4-*.png`, last rounds `v4-r7-*` to `v4-r9-*`): paper tabs from Texturelabs Paper 328 with a real torn top; About and Passwords as torn slips of the same paper, nailed with a rusted nail head (Texturelabs Details 144); buttons A (hover and pressed states, quiet Log Out) with brass plates, rusted corner rivets and an iron Close; weathered flags. Sources and licences: `docs/ASSETS.md`. After screenshots: `docs/visual-after/v4-*.png`.

- **Tabs (all three views):** each inactive tab is a torn note (36 px tall) with a sepia label, a drop shadow that follows the torn edge and a tilt under 1°; hover raises it to 38 px; the active tab is a 40 px painted board joined to the panel. This also fixes the 2018 hover bug, where hover (`--surface-faint`) was lighter than the active tab. The bartender gets wide notes and a kelp board with a white label; "Update Orders" with new orders stays a solid Alarm Fill plate.
- **About and Passwords (1280):** the 25x30 px "<" stubs that grew through the `appear` keyframes are now 60x170 px slips hanging from the top edge. They straighten and drop 4 px on hover or focus (`--lift-in` / `--lift-out`). The `appear` and unused `whiteLetters` keyframes are gone. Phones keep the labelled bottom buttons.
- **Buttons:** hover darkens to 88 %, pressing sinks 1 px with `--shadow-pressed`. Brass plates for Place Order, Place Stock Order and Log In; Log In was the browser-default grey gradient in Arial. Close went from a 26x28 px grey square to a 44 px iron plate. Log Out is a white outline instead of a second red fill.
- **Flags (1280):** tarnish multiplied over each flag with a plaque bevel. Their wrappers now float so each can hold the overlay; phones are unchanged.
- **Tokens added:** `--ink-sepia`, `--brass-light`, `--brass-dark`, `--iron-light`, `--shadow-pressed`, `--shadow-brass`, `--shadow-iron`, `--shadow-plaque`, `--shadow-none`. Removed as unused: `--control`, `--close-bg`, `--about-tab-fill`, `--passwords-tab-fill`, `--dark-grey`. Reduced motion turns off every new transition and the press offset.
- **Contrast** was measured on the worst pixel behind each label, with the text hidden: the sepia label is 5.42:1 or better on the tabs and 5.22:1 or better on the slips; white on the brass is 6.97:1. The texture files were lightened under the labels where needed, and a test checks their darkest pixel (5:1 or better).

| Measure | Before | After |
|---|---|---|
| Inactive tab | flat Copper Tab, black text 4.90:1 | torn paper note, sepia text 5.42:1 or better |
| Tab hover | lighter than the active tab (bug) | peeks up 2 px, still below the active tab |
| About / Passwords at 1280 | 25x30 px "<" stubs, grown by 2018 keyframes | 60x170 px slips, full label always visible |
| Log In button | browser grey gradient, Arial, black text | brass plate, Oswald 20 px, white 6.97:1 |
| Close (login box) | 26x28 px grey square | 44x44 px iron plate |
| Pressed state | none | 1 px press on every button |
| Log Out | second red fill beside the main action | quiet white outline |
| Texture weight per page | 0 | 40 KB customer and management, 57 KB bartender, 53 KB landing |
| `npm test` | 105 | 115; all green, with the management axe test passing on its own after a timeout under parallel load (known) |

Tests added in `tests/textures.spec.js`: the inactive tab is a paper note and the active one the board, with 36 / 38 / 40 px heights at rest, on hover and active; the bartender has wide notes, a kelp board and a solid red alarm; the darkest pixel under every label in the paper files gives sepia at least 5:1; at 1280 both slips hang from the top edge, fully on screen, at least 44 px wide; buttons darken on hover and move 1 px when pressed, and Log Out has no fill and a 2 px outline. All of them fail on the old code.

### T1 done (2026-10-30): small action buttons

First step of the texture plan (`docs/texture-plan.md`); Hassan approved the T1 to T9 order as written. He chose option A (textured plates, no rivets) "with a bit more rust", then A1 of three rust strengths: rust specks from Texturelabs Metal 132 in colour at 70 %. Mockups: `docs/visual-options/t1-buttons.png`, `t1-rust.png`. After screenshots: `docs/visual-after/t1-*.png`.

- **Brass:** management Add +1 / +10 / +100 and bartender Mark as Paid get the brass of Place Order (tarnish over the gold gradient, `--shadow-brass`) plus the rust layer, without rivets. Add buttons now share the V4 hover (88 %) and 1 px press; their old `--gold-deep` hover is gone.
- **Rust-red:** `.red` (Cancel Order; Log Out keeps its outline) is the flag-red gradient down to the new `--rust-dark`, with tarnish and rust, and `--shadow-rust`.
- **Iron:** the bartender TOTAL is an iron plate (Metal 155 and rust over Deep Kelp) with white text; it stays read-only, with no hover or press.
- **New:** `img/textures/rust.webp` (21 KB, made by `tools/textures/gentex6.py`); tokens `--rust-light`, `--rust-dark`, `--shadow-rust`.
- **Contrast** (white label, worst pixel with the text hidden): brass 7.37:1, rust-red 10.5:1, iron 11.13:1. Multiply only darkens, so no file check is needed for white text.

| Measure | Before | After |
|---|---|---|
| Mark as Paid, Add buttons | flat gold, white 4.67:1 | rusty brass plate, white 7.37:1 or better |
| Cancel Order | flat red gradient | rust-red plate, white 10.5:1 or better |
| TOTAL | grey box, black text | iron plate, white 11.13:1 or better |
| Add button hover and press | colour swap only, no press | V4 darken and 1 px press, off with reduced motion |
| Horizontal scroll at 375, 1280 | none | none |
| `npm test` | 115 | 117, all green in one run (management axe included) |

Test added in `tests/textures.spec.js`: Cancel, Mark as Paid and TOTAL carry the rust layer over tarnish or iron with no rivets, and Add +1 darkens on hover and sinks 1 px when pressed. It fails on the old code.

### T2 done (2026-10-30): phone category menu

Hassan chose A of three (one paper sheet; B was stacked torn notes, C an iron panel). Mockup: `docs/visual-options/t2-menu.png`. After screenshots: `docs/visual-after/t2-menu-375.png`, `t2-menu-320.png`.

- **Bug fixed:** each row was `width: 100%` plus padding and a 3 px border with no `box-sizing`, so rows and their black rules ran past the list. Rows are now `border-box` inside a list with `overflow: hidden`.
- **Sheet:** one sheet of Texturelabs Paper 328 (`img/textures/paper-list.webp`, 30 KB, from `tools/textures/gentex6.py`) instead of whitesmoke with a 3 px `--accent-blue` border. Sepia labels and 1 px sepia rules; no rule under the last row.
- **Active item:** the desktop tab board (`board-surface.webp`) with black 600 text, instead of flat sea glass.
- **Tokens:** added `--rule-sepia` and `--hover-sepia`; removed `--paper-soft` and `--hover-grey`, which only this menu used.
- **Contrast** on the worst pixel: sepia 5.21:1 on the sheet, 4.62:1 on a hovered row (passes 4.5:1, under the 5:1 margin used for the tabs), black 8.19:1 on the board.

| Measure | Before | After |
|---|---|---|
| Rows and rules past the list edge | yes | no |
| List | whitesmoke, 3 px blue border | paper sheet, no border |
| Active category | flat sea glass, black 400 | tab board, black 600, 8.19:1 |
| Inactive label | black on whitesmoke | sepia 5.21:1 or better |
| Horizontal scroll at 320, 375 | none | none |
| `npm test` | 117 | 119; all green, with the management axe test passing on its own after a timeout under parallel load (known) |

Test added in `tests/textures.spec.js`: at 375 px the list is the paper sheet with no border, no row runs past it, inactive labels are sepia and the active one is on the board. It fails on the old CSS. The paper-darkness test now also covers `paper-list.webp`.

### T3 done (2026-10-30): About and Passwords windows

Hassan chose A of three (parchment with nails; B was the same paper in a brass frame, C an iron panel). Mockups: `docs/visual-options/t3-windows-1280.png`, `t3-windows-375.png`. After screenshots: `docs/visual-after/t3-about-1280.png`, `t3-passwords-375.png`. No new image files: the windows reuse `paper-list.webp` (T2), `rivet.webp` and `iron.webp`.

- **Sheet:** both windows are an opaque Paper 328 sheet held by two rusted nails at the top corners, with sepia text. Before, they were 50 % red and 50 % green at 1280, so the logo and "Order your Drinks!" showed through the text (V7); phones had solid flag red and green.
- **Close:** the plain white X is now the same 44 px iron plate as the login box Close (one shared rule), with the V4 hover and press.
- **Links:** the GitHub link stays sepia and underlined on hover and press; the global white hover and red press would fail on paper.
- **Tokens removed:** `--about-window-fill`, `--passwords-window-fill`.
- **Contrast** on the worst pixel with the text hidden: sepia 5.28:1 at 1280, 5.68:1 at 375.

| Measure | Before | After |
|---|---|---|
| Window fill at 1280 | 50 % red / green, logo and sign show through | opaque parchment |
| Body text | white on a see-through fill | sepia 5.28:1 or better |
| Close | plain white X | 44 px iron plate, hover and press |
| GitHub link hover / press | white / pure red | sepia, underlined |
| `npm test` | 119 | 121, all green in one run |

Test added in `tests/textures.spec.js`: both windows are the nailed paper over an opaque white base with sepia text, the Close is the iron plate, 44 px wide and below the nails, and the link stays sepia and underlined on hover.

### T4 done (2026-10-30): login box

Hassan chose A of three (wood2 planks; B was Texturelabs Wood 131 "charred hull", C the T3 parchment). Mockups: `docs/visual-options/t4-login-1280.png`, `t4-login-375.png` (with the error state showing). After screenshots: `docs/visual-after/t4-login-1280.png`, `t4-login-375.png`.

- **Overlap bug fixed:** at 1280 the box ended at y 556 while "Order your Drinks!" ran from 512 to 579, so its lower edge peeked out under the box. While the login is open the button is now hidden (`#overlay:not(.hidden) ~ #customer`). Centring the box was tried in the mockups and dropped: it pushed the error toast over Log In.
- **One wood:** the box uses the scrimmed `wood2.jpg` of the working views instead of `wood3.jpg`, which is deleted (licence unknown, now unused). Its extra `--login-scrim` (15 % black) keeps white text at 5:1 where the labels land on the brightest planks; without it the "User name" label was 4.43:1 at 375 px.
- **Iron corners:** a 2.9 KB `border-image` (`img/textures/iron-frame.webp`, Metal 155 toned grey with rivets, from `tools/textures/gentex6.py`) gives four 40 px corner brackets; padding is 32 px at the top and sides so they clear the content, and 12 px at the bottom so the taller box still ends above the error toast (box bottom 570, toast top 572 at 1280).
- **Fields:** Oswald instead of the browser default font, cut into the wood with `--shadow-inset`.
- **Contrast** (white, worst pixel with the text hidden): heading 6.07:1, labels 5.72:1, error message 6.15:1 or better at 1280 and 375.

| Measure | Before | After |
|---|---|---|
| "Order your Drinks!" under the open box | lower edge visible | hidden until the box closes |
| Wood files in use | 2 (`wood2`, `wood3`, both unlicensed) | 1 (`wood2`) |
| Box corners | plain | iron brackets with rivets |
| Field font | browser default (Arial) | Oswald |
| White text, worst pixel | not measured on wood3 | 5.72:1 or better |
| `npm test` | 121 | 123, all green in one run |

Test added in `tests/textures.spec.js`: the box is wood2 (not wood3) with the iron frame, the fields are Oswald, and "Order your Drinks!" is hidden while the box is open and back after Close.

### T5 done (2026-10-30): landing signs

Hassan chose A of three (brass customer sign with iron staff signs; B was all iron, C a wood2 board with iron corners). Mockups: `docs/visual-options/t5-signs-1280.png`, `t5-signs-375.png`. After screenshots: `docs/visual-after/t5-landing-1280.png`, `t5-landing-600.png`, `t5-landing-375.png`.

- **Staff logins:** `.flipper` (used only on the landing page) is now a riveted iron plate (rust and Metal 155 multiplied over `--bar`, four 12 px rivets, `--shadow-iron`) instead of the kelp gradient with a thin white border. The text is 16 px at weight 500 instead of 12.8 px.
- **"Order your Drinks!":** riveted rusty brass like Log In, with 18 px rivets, weight 600 and a small dark text shadow.
- **Wrap bug fixed:** at 415 to 767 px the sign is 30 % wide, so "Drinks!" wraps; the fixed 40 px height left the second line on the storm (4.54:1). The height is now auto with a 44 px minimum, so both lines sit on the brass.
- **Contrast** (white, worst pixel with the text hidden): customer sign 5.2:1 at 320 px and 6.5 to 7.5:1 at the other widths; staff signs 7.36:1 or better (800 px, where they wrap) and 11.25:1 at 1280. No sideways scroll at 320, 375, 600, 800, 1024 or 1280 px.

| Measure | Before | After |
|---|---|---|
| Staff login text | 12.8 px, kelp on the storm | 16 px on iron |
| Customer sign | kelp gradient, same as the staff logins | brass, the only warm plate on the page |
| "Drinks!" at 600 px | off the button, on the storm | on the brass |
| Customer sign height at 320 px | 46 px | 50 px |

Test added in `tests/textures.spec.js`: the customer sign is brass with rivets, at least 44 px high, with no text overflowing it; the staff logins (where shown) are iron at 16 px.

### T6 done (2026-10-30): staff label

Three rounds. Round 1 offered plates (brass, iron, paper tag); Hassan turned them down because a riveted plate looks like a button, and asked to keep usability in mind. Round 2 offered text-only labels; Hassan chose A (icon and text on the wood) and asked for a more pirate look. Round 3 gave three themed versions (A2, role icon with a gilded name, chosen), and round 4 three layouts of it (L1, stacked, chosen). Mockups: `docs/visual-options/t6-nameplate.png` (round 2), `t6-nameplate-a.png`, `t6-nameplate-a2.png`. After screenshots: `docs/visual-after/t6-bartender-{1280,375}.png`, `t6-management-{1280,375}.png`.

- **Not a button:** no plate, border, rivets or raised shadow. Raised plates stay reserved for buttons. An edgeless radial glow of `--wood-scrim` sits behind the text for contrast.
- **Role at a glance:** a 36 px gold Lucide icon, a beer mug for the bartender and a ship's wheel for the manager (both added to `img/icons.svg`). Beside it, the role word in white small caps, with the name under it in gold Berkshire Swash (25 px, the customer greeting's font). The words are unchanged.
- **Overlap fixed:** at 375 px the old grey badge sat on top of the page heading, and at 800 px the label would reach the management title. Below 1024 px the heading now gets 52 px of top padding.
- **Cleanup:** the management label lost its inline `style="color:..."`, the dead `.info` rule in `customer.css` is gone (the customer page has no `.info`), and the `--disabled` token it used is removed.
- **Contrast** (worst pixel, text and halo hidden): gold name 5.77:1 (management, 375 px), white role word 10.79:1 or better, at 320, 375, 600, 800, 1024 and 1280 px.

| Measure | Before | After |
|---|---|---|
| Label | grey `--disabled` box, flush with the top edge | icon and text on the wood |
| Text | 12.8 px, role and name the same | role 12.8 px small caps, name 25 px swash |
| Role shown by | the word only | word and icon |
| Overlaps the heading at 375 px | yes | no (checked at 6 widths) |
| Contrast, worst pixel | 4.54:1 (white on grey) | 5.77:1 or better |

Test added in `tests/textures.spec.js`: each staff page shows its role icon, the label has no box shadow, the name is Berkshire Swash, and the label does not overlap the heading.

### T7 done (2026-10-30): customer order panel

Hassan chose A of three (a paper ledger inside the kelp header and total bar; B kept the kelp with tidied rows, C made the whole column one paper sheet) and asked to keep it to the customer page; the management stock order keeps its kelp for now. Mockup: `docs/visual-options/t7-order-panel.png`. After screenshots: `docs/visual-after/t7-order-{1280,375}-{empty,full}.png`.

- **Ledger:** `#drink_selection` is the Paper 328 sheet (`paper-list.webp`, as in the phone menu) with sepia text. Each drink is one row ruled off with `--rule-sepia`, on a grid: bottle (44 px column, 56 px high) | name | price | trash. The rows were floated sea-glass boxes with 10 % gaps, so the bottle squeezed the name and the gaps were uneven.
- **Only the trash is a button:** rows have no box or shadow.
- **Empty note:** while the order is empty the sheet says "Nothing ordered yet. Choose a drink to add it." in sepia Berkshire Swash. It is CSS (`:empty::before` with `content: attr(data-empty)`), so it appears and goes with the rows without new JS; the language switch sets `data-empty` from the new `empty_order` list in `js/view/view_customer.js` (5 languages; pirate: "Yer tankard be empty! Pick a grog to fill 'er up."). The panel's HTML no longer holds whitespace, so `:empty` matches from the start.
- **Quantity:** the red "(x 2)" was 3.45:1 on the paper, so it is bold sepia now and never wraps mid-way.
- **Contrast** (worst pixel with the text hidden): row text 5.79:1, quantity 6.65:1, empty note 5.72:1, at 1280 and 375 px.

| Measure | Before | After |
|---|---|---|
| Empty panel | blank kelp, 350 px | ruled paper with a note in the current language |
| Row layout | floats, 10 % gaps, bottle squeezes the name | one grid row per drink, ruled |
| Quantity "(x 2)" | red, splits across lines on phones | bold sepia, kept on one line |
| Text contrast, worst pixel | not measured | 5.72:1 or better |

Test added in `tests/textures.spec.js`: the panel is paper, shows the English note while empty, drops it when a drink is added (row is a grid) and shows it again after the trash, and shows the Swedish note after logging in with Swedish.

### T8 done (2026-10-30): bartender order bar and docket

Five rounds. Hassan picked the narrow pinned docket (A), asked to tune it for a quick glance and to try his other textures (A2: a docket head with number and time, quantity first), then asked for an order bar that works with it (B2, a paper stub), with the NOT PAID contrast fixed and clearer cues (C1), then for worn stamps and torn or folded paid slips, and finally for less mess (no ink splashes). Mockups: `docs/visual-options/t8-docket.png`, `t8-docket-2.png`, `t8-docket-3.png`, `t8-order-bar.png`, `t8-order-bar-2.png`, `t8-order-bar-3.png`. After screenshots: `docs/visual-after/t8-queue-{1280,375}.png`, `t8-docket-{1280,375}-{unpaid,paid}.png`.

- **Order bar:** each order is a Paper 320 slip in columns read left to right: ORDER number, customer, date and time, total, state, and a chevron that turns (it replaces the "Open Order" / "Hide Order" text). On phones it folds into two rows. The labels "Customer:" and "Date:" stay for screen readers only, so the bar still reads "ORDER #00020 …" without "|" or ":::" noise.
- **State at a glance, never by colour alone:** not paid = raised slip, red left edge, a solid red NOT PAID stamp (new; unpaid orders had no mark). Paid = flat slip, kelp edge, torn right edge (mask), folded top-right corner (`--paper-ear`), and a kelp PAID stamp with the bartender's name. Both stamps are worn by an InkPaint 128 mask that keeps 90 % ink or more.
- **Docket:** the open order is a 480 px slip of Paper 320 pinned with a tack (Details 141). Its head shows the order number (31 px) and time; each drink is one ruled line with the quantity first ("15×"), bottle, name and price; then the total above a double rule, and Cancel and Mark as Paid side by side (48 px). A paid docket gets the folded corner and a worn "TOTAL PAID" stamp.
- **TOTAL is text, not a plate:** the T1 iron TOTAL looked like a button but cannot be clicked (Hassan's rule from T6); it is now bold text on the docket. Its duplicate `id="total"` per order is gone.
- **Fixed:** "TOTAL PAID" was white on pale sea glass at 1.61:1; it is now Deep Kelp ink on paper. `<h1>` inside each paid order is now a `<p class="stamp">`.
- **Code:** `printToDOM` and `printOrder` in `js/bartender.js` write the new markup; `zoom_out` is gone (the cursor comes from `.accordion.active`). `img/icons.svg` gains Lucide `chevron-down`. New textures from `tools/textures/gentex7.py`: `docket.webp`, `tack.webp`, `stamp-wear.webp`, `torn-edge.webp` (51 KB together).
- **Contrast** (worst pixel with the text hidden; stamps at 90 % ink): bar text 6.81:1, NOT PAID 7.3:1, PAID 5.13:1, docket lines 6.45:1, total 6.66:1, TOTAL PAID stamp 5.21:1, at 1280 and 375 px.

| Measure | Before | After |
|---|---|---|
| Order bar | one run-on line with "\|" and ":::" separators, white box | columns on paper, state stamp, turning chevron |
| Unpaid / paid cue | "ORDER PAID" text only on paid | edge colour, raised or flat, torn and folded, stamp word |
| Open order | 100 × 250 px white squares per drink | pinned docket, one line per drink, quantity first |
| TOTAL | raised iron plate (not clickable) | bold text above the buttons |
| "TOTAL PAID" contrast | 1.61:1 | 5.21:1 |

Tests: the T1 test no longer expects an iron TOTAL; a new test in `tests/textures.spec.js` checks the state stamps, raised versus flat and torn bars, the tack and docket paper, the "#number" head, the "15×" quantity, a TOTAL without a plate, and only two buttons in the docket.

### T9 done (2026-10-30): toasts

Three rounds. Hassan liked the pinned note (A) and asked for other textures and a smoke or fog effect, then to refine the fog version (A2). He picked F2, low sea mist. Mockups: `docs/visual-options/t9-toast-{1280,375}.png`, `t9-toast-A-{1280,375}.png`, `t9-toast-A2-{1280,375}.png`. After screenshots: `docs/visual-after/t9-toast-{1280,375}-{0,1}.png` (0 = success, 1 = error).

- **Note:** the toast is a Paper 329 note with a burnt rim, drawn with a 9-slice `border-image` so the rim keeps its 16 px at any width. It is pinned with the T8 tack (with its own shadow), tilted 1°, and floats on `--shadow-float`. The text is sepia Oswald with a 1 px ink bleed. The icon is drawn thicker and worn with the stamp-wear mask.
- **Error, never by colour alone:** the alert icon shape (success shows a check) and a worn red ribbon down the left edge. The note tilts the other way.
- **Sea mist:** an Atmosphere 142 mist bank sits behind and below the note on `.toast_wrap::before`. It fades in and rises 16 px with the toast tokens (`--toast-open` / `--toast-close`, `--toast-distance`), and does not move under reduced motion. It has `pointer-events: none`, so it never blocks clicks. It dims the flags and Undo below the note while the toast is open (about 4 s).
- **Code:** CSS only in `css/style.css` (`.toast`, `.toast::after` tack, `.toast.is-error::before` ribbon, `.toast_wrap::before` mist); `showToast` in `js/login.js` is unchanged. New textures from `tools/textures/gentex8.py`: `note.webp` and `mist.webp` (46 KB together).
- **Contrast** (worst pixel with the text hidden): 6.61:1 or better at 1280 and 375 px, for both success and error.

| Measure | Before | After |
|---|---|---|
| Toast | Deep Kelp box, white text | burnt paper note pinned with a tack, sea mist under it |
| Error cue | alert icon, pink | alert icon, red ribbon, opposite tilt |
| Text contrast | 10.48:1 | 6.61:1 |

Tests: a new test in `tests/textures.spec.js` checks the note `border-image`, the tack, the mist (hidden at rest, over 0.9 opacity when a toast is open, never catching clicks), and the red ribbon and alert icon on an error.

Seen in passing, not fixed: `customer.html` has two buttons with `id="pay"` (the desktop small button and the phone pay button).

### V5 done (2026-10-30): order panel

T7 already gave the panel its paper ledger and empty note. V5 fixed the rest over six rounds. Hassan found the rust-red plates too harsh. He rejected iron, sepia and kelp remove buttons ("a green button to delete is a bad design": the colour must match the meaning). He then asked for hand-drawn marks and picked a natural pressure brush (N1). Mockups: `docs/visual-options/v5-order-{1280,375}.png`, `v5-order-{A,B,C,D,E}-{1280,375}.png`, `v5-order-E-zoom.png`. After screenshots: `docs/visual-after/v5-order-{1280,375}.png`.

- **Rows:** a handwritten Berkshire Swash tally comes first ("3×", as on the T8 docket), then the bottle, name and price. The old "( x 3)" glued to the name is gone. Rows are at least 64 px tall with even padding.
- **Remove:** a red ink brush cross (`cross-brush` in `img/icons.svg`, drawn by `tools/textures/brush.py`), with no plate. Its target is 40 px, or 44 px on phones. Hover and keyboard focus add a light red wash, a brush strike drawn left to right across the row (`img/textures/strike.svg` mask, toast motion tokens, still under reduced motion), and fade the bottle, so you see what will go before you press. Undo in the footer still brings a removed drink back.
- **Total:** a small-caps "TOTAL:" label and the amount in gold, from the five-language `total_label` list. The old list was named `total` and was overwritten by the running total in `customer.js`, so the label never translated. The stray space in "SEK 0 :-" is gone.
- **Duplicate id:** the phone Place Order is now `id="pay_phone"`, and both buttons share one handler.
- **Contrast** (worst pixel with the text hidden): tally 5.69:1, cross 3.38:1 (non-text, needs 3:1), TOTAL label 4.88:1, amount 6.44:1, at 1280 and 375 px. A new `--hover-danger` token holds the red wash.

| Measure | Before | After |
|---|---|---|
| Quantity | "( x 3)" after the name, red | "3×" first, handwritten sepia |
| Remove | solid orange square, then rust plates | red ink brush cross, no plate, strike preview |
| Total | "Total: SEK 0 :-", soft green, small, never translated | small-caps label and gold amount, 5 languages |
| Place Order ids | two `id="pay"` | `pay` and `pay_phone` |

Tests: the assets test expects `cross-brush`; a new test in `tests/textures.spec.js` checks the tally, the plateless red cross, the strike on keyboard focus, the total label in English and Swedish, and a single `id="pay"`. The management stock order keeps its trash icon (T7 kept it kelp).

### V6 done (2026-10-30): header and footer

Hassan chose the credit label top right in the staff label pattern (HA) with a better coin, and a flag line in the footer. The flag line took four rounds: a straight brass line with tilted flags, a drawn hemp rope with pegs, a drawn rope with rivet ends and cord ties ("these look cheap"), and then, from photos he added, a real hemp cord between two rusty nails with the flags sewn straight on, like street bunting. Mockups: `docs/visual-options/v6-header-{1280,375}.png`, `v6-footer.png`, `v6-coins.png`, `v6-coin-rope.png`, `v6-flags-cloth.png`, `v6-flags-tied.png`, `v6-flags-photo.png`. After screenshots: `docs/visual-after/v6-*.png`.

- **Credit label:** the customer credit moves from a plain line beside the greeting to the top right, as icon, small-caps word and gold swash amount on an edgeless dark glow, the same pattern as the T6 staff label. The icon is a hand-struck gold cob coin (`img/textures/coin.webp`). The word is "Credit:" in five languages ("Doubloons:" in Pirate) and the amount reads "SEK 400:-". `#cre` still holds only the number, so the payment check in `customer.js` is unchanged. Non-VIP customers still see no credit.
- **Phones:** the greeting and the credit were hidden below 769 px. They now share one 52 px row above the menu, undo/redo and Log Out row. A long name ends in "..." before the label; at 320 px both step down a size.
- **Staff titles:** "Orders Queue" and "Drink Delivery Database System" are now in Berkshire Swash, like the customer greeting.
- **Flag line:** in the three app footers the flags are worn cloth (faded, folded, stained, torn at the fly), sewn onto a sagging hemp cord nailed at both ends. Each flag sits at a fixed point along the cord at any width (the first and last margins come from the container width in `cqw`), so its drop and its angle (`atan2`) follow the cord. The enamel plaques stay on the landing page until V7.
- **Footer layout:** at 769 px and up the footer is one flex row, the flags centred between Log Out and undo/redo. It used to centre a 50 % float box, so the flags sat left of the middle. Between 769 and 1099 px the flags are 48 px wide so the row still fits; on phones 56 px, and 46 px below 360 px.
- **Duplicate id:** the phone Log Out on the customer page is now `id="logout_phone"`.
- **Contrast** (worst pixel with the text hidden, 1280, 800, 375 and 320 px): credit word 11.53:1, gold amount 7.41:1, greeting 6.74:1, staff titles 5.71:1.

| Measure | Before | After |
|---|---|---|
| Customer credit | plain line beside the greeting, hidden on phones | coin label top right, on phones too |
| Staff titles | Oswald | Berkshire Swash, like the greeting |
| Flags | enamel plaques left of centre | cloth flags sewn on a nailed hemp cord, centred |
| Log Out ids | two `id="logout"` | `logout` and `logout_phone` |

Tests: a new test in `tests/textures.spec.js` checks the coin label (no plate, clear of the greeting, Pirate word), one `id="logout"`, the cord and nails, the five cloth flags, that the middle flag hangs lowest, no sideways scroll, and the swash staff title. Not checked: a real phone, and browsers without `atan2()` in CSS (older than Chrome 111, Firefox 108, Safari 15.4), where the flags hang straight.

