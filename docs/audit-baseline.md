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
