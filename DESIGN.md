---
name: The Flying Dutchman
description: Pirate tavern ordering system with sea-glass panels on dark wood.
colors:
  sea-glass: "#a4b9b6"
  pale-sea-glass: "#c0cfcc"
  seafoam: "#96b9a5"
  weathered-copper: "#567973"
  copper-muted: "#4a6a65"
  deep-kelp: "#254540"
  abyss: "#0c2924"
  brass-doubloon: "#926e30"
  brass-doubloon-deep: "#84642b"
  brass-shadow: "#4a3412"
  brass-glint: "#e8c77e"
  iron-glint: "#8c9a96"
  sepia-ink: "#2a1709"
  rum-red: "#ad2535"
  rum-red-deep: "#8e1f2c"
  alarm-red: "#8b0000"
  alarm-fill: "#c8102e"
  error-tint: "#ffb4a8"
  badge-grey: "#767676"
  ink: "#000000"
  sail-white: "#ffffff"
typography:
  display:
    fontFamily: "'Berkshire Swash', cursive"
    fontSize: "clamp(1.953rem, 1.6rem + 1.2vw, 2.441rem)"
    fontWeight: 400
  headline:
    fontFamily: "'Oswald', sans-serif"
    fontSize: "1.563rem"
    fontWeight: 600
  body:
    fontFamily: "'Oswald', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "'Oswald', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
rounded:
  sm: "4px"
  md: "8px"
  round: "50%"
spacing:
  xs: "3px"
  sm: "10px"
components:
  button-primary:
    backgroundColor: "{colors.brass-doubloon}"
    textColor: "{colors.sail-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px"
  button-danger:
    backgroundColor: "{colors.rum-red}"
    textColor: "{colors.sail-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px"
  button-landing:
    backgroundColor: "{colors.deep-kelp}"
    textColor: "{colors.sail-white}"
    rounded: "{rounded.md}"
  tab-active:
    backgroundColor: "{colors.sea-glass}"
    textColor: "{colors.ink}"
    height: "40px"
  tab-inactive:
    backgroundColor: "img/textures/tab-note1.webp"
    textColor: "{colors.sepia-ink}"
    height: "36px"
  card-drink:
    backgroundColor: "{colors.pale-sea-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  panel-order:
    backgroundColor: "{colors.deep-kelp}"
    textColor: "{colors.seafoam}"
---

# Design System: The Flying Dutchman

<!-- Documented from the 2018 implementation on 2026-10-28. Updated in Phase 2 (2026-10-28) for WCAG 2.2 AA contrast and focus; every changed value below is measured. -->

## Overview

**Creative North Star: "The Captain's Tavern"**

A warm wooden bar on a pirate ship. Dark wood planks (`img/wood2.jpg` under a 45 % black scrim, `--wood`) cover the background of all three working views. Sea-glass green panels sit on top like frosted portholes, with brass and rum-red fittings for the actions that matter. The storm (`img/storm.jpg`) and the ship logo (white paint on old sailcloth, `img/logo/aged.webp`) belong to the landing page only: the storm stays outside, and inside the tavern it is cosy and hospitable.

The working views (customer, bartender, management) are tools first. The theme lives in materials (wood, sea glass, brass), in the swash display font, and in the Pirate language option. Layout and controls follow familiar patterns: tabs over a product grid, an order panel on the right, and primary and danger buttons at the bottom.

**Key Characteristics:**
- One scrimmed wood texture under every working view; storm photo on the landing page.
- Cool sea-glass greens for surfaces, warm brass and rum red for actions.
- Berkshire Swash for greetings and titles, Oswald for everything else.
- Deep two-layer shadows that lift every panel off the wood.

## Colors

Cool, desaturated sea greens for surfaces, with two warm metals saved for actions.

### Primary
- **Brass Doubloon** (gradient from brass-doubloon `#926e30` to brass-doubloon-deep `#84642b`): the main action, such as Place Order and confirm buttons. White labels: 4.67:1 at the top, 5.47:1 at the bottom. The 2018 top `#aa8139` gave white only 3.55:1.

### Secondary
- **Rum Red** (gradient from rum-red to rum-red-deep): destructive or exit actions, such as Log Out and remove. White labels: 6.79:1 to 8.81:1.

### Neutral
- **Sea Glass**: the active category tab, joined to the product area beneath it.
- **Pale Sea Glass**: drink cards and the main product area.
- **Weathered Copper**: secondary list rows and the customer order panel.
- **Sepia Ink** (`#2a1709`, `--ink-sepia`): labels on the paper tabs and the About and Passwords slips. 5.0:1 or better on the darkest pixel behind any label (tested on the texture files).
- **Muted Copper** (`#4a6a65`): the zero-stock count in management, 3.68:1 on the Pale Sea Glass card, so only at the 31 px stock number (large text); its label stays black.
- **Deep Kelp**: the order and checkout panel, and the top of the landing-page button gradient.
- **Abyss**: the darkest green, used for the bottom of the landing-page gradient and the bartender panel borders.
- **Seafoam**: headings and totals on Deep Kelp panels.
- **Ink**: body text on sea-glass surfaces and button labels.
- **Sail White**: display headings and text on the wood and storm backgrounds.

### Feedback
- **Alarm Red** (`#8b0000`): status text such as LOW STOCK, OUT OF STOCK, ORDER PAID and shortage counts. At least 4.86:1 on every sea-glass surface. The 2018 `#ff0000` was 1.94:1 to 2.48:1.
- **Error Tint** (`#ffb4a8`): the toast error icon, the login error icon and the border on a wrong login field. Used only on dark surfaces, never for body text.
- **Badge Grey** (`#767676`): the staff name badge in the top-right corner, with white text at 4.54:1.
- **Alarm Fill** (`#c8102e`): the "Update Orders" tab background when new orders arrive, with a white label at 5.88:1.

### Named Rules
**The Two Metals Rule.** Warm colour means action. Brass is for the primary action and Rum Red for leaving or destroying. Surfaces never use either metal.

## Typography

**Display Font:** Berkshire Swash (with cursive)
**Body Font:** Oswald (with sans-serif)
**Label/Mono Font:** Consolas, Menlo, Courier (monospace), used only in the bartender order details.

**Character:** A hand-painted tavern sign over a condensed, sturdy working face. The swash brings the pirate voice; Oswald keeps dense lists of drinks and orders scannable.

### Hierarchy
Scale of 1.25 in rem, as tokens in `:root` of css/style.css. Oswald loads as one variable face (400 to 700) and `font-synthesis: none` stops faked bold.
- **Display** (`--text-display`, 31.25 to 39 px, 400): the swash greeting, such as "Hello John!", in Sail White over wood. Berkshire Swash has no bold.
- **Title** (`--text-xl`, 31.25 px, 600): page titles such as "Orders Queue".
- **Headline** (`--text-lg`, 25 px, 600): panel titles such as "Your Order", in Seafoam.
- **Label** (`--text-md`, 20 px, 500 or 600): button text, the credit line, the order total.
- **Body** (`--text-base`, 16 px, 400): list rows and details. Drink names 500; prices and `<b>` labels 600.
- **Small** (`--text-xs`, 12.8 px): staff logins and "Open Order" hints.

Spacing steps: `--space-1` to `--space-7` = 4, 8, 12, 16, 24, 32, 48 px. Components move from percent spacing to these steps as each one is polished.

### Named Rules
**The One Swash Rule.** Berkshire Swash appears once per view, for the greeting or title. Everything a user must read quickly is Oswald.

## Layout

Fluid, percentage-based layout with no fixed grid. On desktop, the customer view is two columns: the tabbed drink grid on the left (about two thirds) and the order panel on the right. Action buttons and language flags sit in a bottom bar. The management view uses the same two columns from 1024 px up. Under 768 px the customer columns stack, the category tabs collapse into a hamburger menu, and the drink grid becomes a single column of wide cards.

Breakpoints in the code: 414 px (phones) and 768 px (tablets). Spacing is ad hoc: percentages for margins, and small pixel values (3 px, 10 px) inside controls.

## Elevation & Depth

Depth comes from shadows, not from tonal layering. Each shadow has two layers of 65 % black (`--shadow-lift`): a tight contact shadow and a wide soft one, so panels and tabs look raised off the wood without the smudged edges of the 2018 pure-black recipes.

### Shadow Vocabulary
- **Raised** (`--shadow-raised: 0 2px 6px, 0 10px 26px`): panels and tabs on the wood (drink list, order panel, order queue, category tabs).
- **Float** (`--shadow-float: 0 2px 6px, 0 12px 28px`): buttons, the category menu, toasts and landing buttons.
- **Brass, Iron** (`--shadow-brass`, `--shadow-iron`): Float plus an inset bevel (light top edge, dark bottom edge) for the metal buttons.
- **Pressed** (`--shadow-pressed: 0 1px 2px`): a button held down.
- **None** (`--shadow-none`): the quiet Log Out outline.
- Paper tabs and slips use a `drop-shadow` filter instead, so the shadow follows the torn edge.
- The focus ring (`0 0 0 6px` Ink) is not a lift and stays as it is.

### Named Rules
**The Carved Wood Rule.** Every surface on the wood background has a shadow. A panel without one looks pasted on.

## Shapes

Softly squared, from two tokens: `--radius-sm` (4 px) for buttons and inputs, `--radius-md` (8 px) for cards, panels and dialogs. Category tabs and the About and Passwords slips have no corners: their shape is the torn paper edge. `--radius-round` (50 %) is for the bartender's status circle. No percentage corners.

## Components

### Buttons
Sturdy and tactile, like brass fittings on a bar.
- **Shape:** gently squared (`--radius-sm`, 4 px), no border, float shadow.
- **Primary (Brass Doubloon plate):** Place Order, Place Stock Order and Log In. The brass gradient runs down to Brass Shadow (`#4a3412`), the tarnish scan (`tarnish.webp`, Texturelabs Metal 132) is multiplied over it, and a rusted rivet (`rivet.webp`, Texturelabs Details 144) sits in each corner. A Brass Glint top edge and a dark bottom edge make the bevel (`--shadow-brass`). Multiply only darkens, so the white label is 6.97:1 or better.
- **Danger (Rum Red):** same shape with the rum-red gradient and a white label.
- **Log Out (quiet):** a 2 px Sail White outline on the wood, no fill, no shadow; a dark scrim on hover. Leaving is never styled as the main action.
- **Close (iron):** 44 px weathered iron plate (`iron.webp`, Texturelabs Metal 155) multiplied over Deep Kelp, white X, `--shadow-iron` bevel.
- **States:** hover darkens to 88 % brightness (150 ms in); pressing sinks the button 1 px, darkens to 80 % and shrinks the shadow to `--shadow-pressed`. No motion under reduced motion.
- **Landing (Deep Kelp to Abyss):** dark green gradient, white label, float shadow, 8 px corners. Used for "Order your Drinks!" and the staff login buttons.
- **Focus:** every control uses one two-tone ring: a 3 px Sail White outline plus a 6 px Ink halo (`outline: 3px solid #fff; box-shadow: 0 0 0 6px #000`). One of the two colours always reaches at least 4.58:1, on any surface.
- **Markup:** every control is a native `<button>` (since Phase 2); the 2018 `<div>`s inside `<a>` are gone.
- **Footer buttons** (Log Out, Place Order) fit their label with 24 px side padding, which leaves room for the Undo/Redo words.

### Tabs (drink categories)
- **Inactive:** a torn sailors' note (`tab-note1-3.webp`, cut from Texturelabs Paper 328) with a real torn top, fibre fringe and grime, sepia label, a soft drop shadow, tilted by under 1°. Neighbours use different cuts. 36 px tall; on hover it peeks up to 38 px.
- **Active:** a painted Sea Glass board (`board-surface.webp`, Poly Haven Green Rough Planks), 40 px tall, joined to the product area, black label 8.89:1.
- **Bartender:** wide notes (`tab-note-wide1-3.webp`) for its wider tabs; the active board is Weathered Copper kelp (`board-kelp.webp`) with a white label. "Update Orders" with new orders stays a solid Alarm Fill plate (5.88:1).
- Selected tab carries `aria-pressed="true"`.

### About and Passwords slips (landing page, 1280)
- Two torn slips of the same paper hang from the top edge, each held by a rusted nail head with a rust stain bleeding into the paper (`slip1-2.webp`). Vertical sepia label, 60x170 px, tilted -2° and 1.5°; on hover or focus they straighten and drop 4 px. Under 769 px they stay the labelled red and green bottom buttons.

### Demo logins (Passwords window)
- Accounts grouped by role, each heading led by a Brass Shadow role icon (crown VIP, user, beer, ship wheel, flask for the test users). Rows are name, password and a secondary Use button: a 1.5 px sepia outline with a log-in icon, no plate, so it never competes with the brass Log In it leads to. Hover and focus add a light sepia wash (`--hover-sepia`). Use fills the login form and focuses Log In. From 1100 px the sheet widens to two columns (customers, crew) with the test users across the bottom.

### Landing logo and easter egg
- The ship logo is lightly aged sailcloth (Paper 328, sparse fine wear) with a dark drop shadow that lifts it off the storm. It is a toggle button ("The Flying Dutchman: summon the ghost ship", `aria-pressed`). Dropping the pirate flag on it, or pressing it, crossfades to Eilshemius' ghost-ship painting (1908, public domain), feathered into the storm; again brings the logo back. 250 ms fade with `--toast-ease`, none under reduced motion.

### Language flags
- On every page (landing since V7) the flags are worn cloth sewn onto a hemp cord between two rusty nails. The flags are named images, so no text contrast applies.

### Cards / Containers
- **Drink card (customer):** Pale Sea Glass on a shelf grid, as many 160 px columns as fit (4 at 1280, 2 on phones, 140 px min there). Fixed rows: name (two lines), bottle (160 px, 112 on phones), price, so a stock badge never moves the name. 8 px corners, no shadow at rest; on hover it lifts 2 px with the Float shadow (150 ms in, 250 ms out, none under reduced motion) and drops back while pressed (the shadow stays).
- **Stock badges:** small white label on Rum Red for low stock (6.22:1) and on Deep Kelp for out of stock (10.48:1), under the price, in all 5 languages. An out-of-stock card keeps full opacity, greys its bottle and cannot be pressed.
- **Drink card (management):** one Pale Sea Glass row: bottle (112 px column) | details | stock number (31 px) under a small black uppercase label | three stacked brass Add buttons with 4 px corners and the Float shadow. About 224 px tall. Phones: bottle beside the details, then the stock line and the three Add buttons side by side (44 px).
- **Order panel:** Deep Kelp, Seafoam heading and total, with Place Order at its foot.

### Inputs / Fields
- **Login fields:** browser-default text inputs inside a centred login box over a dark overlay. No custom focus or error styling.

### Navigation
- **Language flags:** five flag images in a row, 64x40 (true 1.6:1 ratio, 56x35 on phones) with 4 px corners and the Float shadow, which switch the interface language. The Pirate flag is also draggable for the Easter egg.
- **Mobile menu:** a white hamburger button replaces the tabs below 768 px; it opens on hover or keyboard focus.
- **Undo / Redo:** curved undo icons with a visible word from 1250 px up; icon-only below, with the word kept for screen readers.

### Icons
- **Set:** Lucide line icons (ISC) from one local sprite, `img/icons.svg`, used as `<svg class="icon"><use href="img/icons.svg#name"/></svg>`. 2 px round strokes in `currentColor`, so an icon always takes its text colour. `.icon-2x` doubles the size for the menu and undo/redo buttons.
- **Meaning:** `trash` removes a drink from an order; `x` closes a dialog; `undo`/`redo`, `menu`, `check` (toast), `alert` (errors). Every icon is `aria-hidden`; its button carries the name.
- **Don't:** load an icon font or CDN, or use a letter (like "X") as an icon.

### Feedback (toast and announcements)
- **Toast:** a Deep Kelp panel with a white Oswald label and a Seafoam check icon (Error Tint for errors). It sits bottom centre above the footer, and becomes full width at the bottom under 768 px. It rises in with the transitions-dev toast motion (350 ms in, 250 ms out) and stays 4 s + 60 ms per character, pausing while hovered. No motion under `prefers-reduced-motion`.
- **Announcements:** one visually hidden `aria-live="polite"` region carries every message, including order changes ("Heineken added. Total: SEK 100:-"). The toast is `aria-hidden`, so nothing is read twice.
- **Login error:** white bold message with an Error Tint icon under the form, an Error Tint border and `aria-invalid` on the wrong field, and the transitions-dev error shake. Typing clears it.

### Bartender order accordion (signature)
Each order is a `<button class="accordion">` row showing the order number and customer. It expands with a 0.2 s `max-height` ease-out to show items and actions.

## Do's and Don'ts

### Do:
- **Do** keep `--wood` under the working views and the storm on the landing page only. Never show the wood without its scrim: bare wood2 drops Sail White to 2.82:1 on bright planks.
- **Do** use Brass Doubloon for the single primary action in a view and Rum Red for exit or destructive actions.
- **Do** set panel headings in Seafoam on Deep Kelp, and body text in Ink on sea-glass surfaces.
- **Do** give every raised surface on the wood `--shadow-raised` or `--shadow-float`.

### Don't:
- **Don't** use brass or red for surfaces or decoration; they mean action.
- **Don't** use Berkshire Swash for prices, lists, labels or buttons.
- **Don't** put Ink text directly on the wood or storm backgrounds; use Sail White there.
- **Don't** add new one-off greens. Pick from the documented sea-glass and copper neutrals.
