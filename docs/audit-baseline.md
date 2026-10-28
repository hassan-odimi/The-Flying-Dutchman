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
