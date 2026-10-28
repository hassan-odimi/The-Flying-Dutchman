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
