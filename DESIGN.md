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
    fontFamily: "'Pirata One', serif"
    fontSize: "clamp(1.953rem, 1.6rem + 1.2vw, 2.441rem)"
    fontWeight: 400
  headline:
    fontFamily: "'Alegreya Sans', sans-serif"
    fontSize: "1.563rem"
    fontWeight: 700
  body:
    fontFamily: "'Alegreya Sans', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "'Alegreya Sans', sans-serif"
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
- Pirata One (blackletter) for greetings and titles, Alegreya Sans for everything else.
- Deep two-layer shadows that lift every panel off the wood.

## Colors

Cool, desaturated sea greens for surfaces, with two warm metals saved for actions.

### Primary
- **Brass Doubloon** (gradient from brass-doubloon `#926e30` to brass-doubloon-deep `#84642b`): the main action, such as Place Order and confirm buttons. White labels: 4.67:1 at the top, 5.47:1 at the bottom. The 2018 top `#aa8139` gave white only 3.55:1.

### Secondary
- **Rum Red** (gradient from rum-red to rum-red-deep): destructive or exit actions, such as Log Out and remove. White labels: 6.79:1 to 8.81:1.

### Neutral
- **Sea Glass**: the product area under the tabs. The selected tab no longer joins it (F7).
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
- **Alarm Fill** (`#c8102e`): the bartender's "Update Orders" plate (an action, not a tab) background when new orders arrive, with a white label at 5.88:1.

### Named Rules
**The Two Metals Rule.** Warm colour means action. Brass is for the primary action and Rum Red for leaving or destroying. Surfaces never use either metal.

## Typography

**Display Font:** Pirata One (with serif), token `--font-display`
**Body Font:** Alegreya Sans (with sans-serif), token `--font-body`
**Label/Mono Font:** Consolas, Menlo, Courier (monospace), used only in the bartender order details.

**Character:** A blackletter tavern sign over a warm, humanist working face. Pirata One brings the pirate voice; Alegreya Sans keeps dense lists of drinks and orders scannable.

### Hierarchy
Scale of 1.25 in rem, as tokens in `:root` of css/style.css. Alegreya Sans loads real 400, 500 and 700; Pirata One only 400. `font-synthesis: none` stops faked bold, and `body` sets `font-variant-numeric: lining-nums tabular-nums` so prices and order numbers line up.
- **Display** (`--text-display`, 31.25 to 39 px, 400): the greeting, such as "Hello John!", in Sail White over wood. Pirata One has no bold.
- **Title** (`--text-xl`, 31.25 px, 700): page titles such as "Orders Queue".
- **Headline** (`--text-lg`, 25 px, 700): panel titles such as "Your Order", in Seafoam.
- **Label** (`--text-md`, 20 px, 500 or 700): button text, the credit line, the order total.
- **Body** (`--text-base`, 16 px, 400): list rows and details. Drink names 500; prices and `<b>` labels 700.
- **Small** (`--text-xs`, 12.8 px): staff logins and "Open Order" hints.

Spacing steps: `--space-1` to `--space-7` = 4, 8, 12, 16, 24, 32, 48 px. Components move from percent spacing to these steps as each one is polished.

### Named Rules
**The One Display Rule.** Pirata One appears for the greeting, titles and names. Everything a user must read quickly is Alegreya Sans.

## Layout

Fluid, percentage-based layout with no fixed grid. On desktop, the customer view is two columns: the tabbed drink grid on the left (about two thirds) and the order panel on the right. Action buttons and language flags sit in a bottom bar. The management view uses the same two columns from 769 px up (cards stack their stock and Add buttons below 1024 px). Under 768 px the customer columns stack, the category tabs collapse into a hamburger menu, and the drink grid becomes a single column of wide cards.

**Tabs (F7).** Idle notes are dimmed (`brightness(.95) saturate(.7)`; the planned .82 gave 3.7:1 for sepia text, .88 gave 4.09, .95 gives 4.67:1). A hovered note is clean paper and lifts to 38 px. The selected note keeps its torn paper, turns warm (`saturate(2.2) sepia(.25) brightness(.96)`), stands 46 px tall pulled 6 px up, text one step larger and bold (black, 6.58:1), pinned with a rusty tack (`rivet.webp`, decorative). The phone category list marks its selected item with `--tab-tint`. Customer notes fit their label (`width: auto`, 11 % minimum) and tighten their padding below 1100 px so Spanish stays on one row from 850 px. Update Orders is an F6 iron plate that does not lift; new orders turn it alarm red and add a hidden "(new orders)" label in five languages. A new order also pins a red wax seal (`seal-red.webp`, 28 px, decorative) on its corner.

**Page shell (F5).** From 769 px wide and 600 px high each page is one screen: a grid on `body` with rows header, tab row, main, footer (`css/style.css`). Only the drink list, order list and bartender list scroll; the tab row never does. Under 600 px high the 2018 floats and normal page scrolling take over. Phones keep the stacked layout.

Breakpoints in the code: 414 px (phones) and 768 px (tablets). Spacing is ad hoc: percentages for margins, and small pixel values (3 px, 10 px) inside controls.

## Elevation & Depth

Depth comes from shadows, not from tonal layering. Each shadow has two layers of 65 % black (`--shadow-lift`): a tight contact shadow and a wide soft one, so panels and tabs look raised off the wood without the smudged edges of the 2018 pure-black recipes.

### Shadow Vocabulary
- **Raised** (`--shadow-raised: 0 2px 6px, 0 10px 26px`): panels and tabs on the wood (drink list, order panel, order queue, category tabs).
- **Float** (`--shadow-float: 0 2px 6px, 0 12px 28px`): buttons, the category menu, toasts and landing buttons.
- **Brass, Iron** (`--shadow-brass`, `--shadow-iron`): Float plus an inset bevel (light top edge, dark bottom edge) for the metal buttons.
- **Pressed** (`--shadow-pressed: 0 1px 2px`): a button held down.
- **None** (`--shadow-none`): the iron plates and the bolt Close, which use a `drop-shadow` filter instead.
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
- **Worn iron plates (F6):** Log Out, Undo and Redo share one chipped iron plate (`plate-worn.webp`), white label with a 1 px dark shadow, no box-shadow (a `drop-shadow` filter follows the chipped outline), tilts Log Out -0.6 deg and Redo +0.8 deg. Hover brightens 12 %, press sinks 1 px, disabled keeps 0.5 opacity. White is 5.5:1 at rest and 4.58:1 on hover on the worst pixel. Quieter than the brass Place Order, so leaving is never the main action.
- **Undo/Redo anchors (F6):** a tilted anchor (`icons/anchor.webp` as a CSS mask in the text colour), Undo -32 deg (counter-clockwise like the old arrow), Redo +32 deg. The words show at every width, down to 320 px in Spanish.
- **Close (bolt head, F6):** 48 px round bolt (`bolt.webp`, Texturelabs Details 141 + Metal 132), white X stroke 3 with a 1 px dark shadow, white 5.4:1 on the worst pixel.
- **Drink cards (F8):** torn label cards on four baked papers (`card-paper1..4.webp`, alpha edges, so the shadow is a `drop-shadow` filter, not `box-shadow`), sepia text (5.2:1 on the darkest pixel). Hover and keyboard focus lift 2 px, tilt -0.8 deg and warm the paper (`saturate(1.4) sepia(.12)`), deeper shadow. Reduced motion: no transform.
- **Management rows and the order ledger (F12):** each drink is a compact torn paper row on four baked papers (`row-paper1..4.webp`, alpha edges, `drop-shadow` filter, a 0.3 deg alternating tilt). From 1536 px: bottle | specs in two columns | stock count (40 px, `--text-xxl`) | Add +1/+10/+100 in a row. From 1280 to 1535 px the stock count sits over the Add buttons (three columns), because the list is too narrow for four. Under 1280 px the row becomes the two-row card (bottle and specs, then stock, then Add) on `card-paper1` and `card-paper4`, the two papers whose tears stay clear of the text. Long Add labels (Aggiungere +100) wrap to a second line. Your Order uses the customer ledger, now shared in `style.css` (`#drink_selection .order`: quantity, bottle, name, price, remove); in a narrow ledger (container under 400 px, which includes a phone) the price sits under the name. Specs 5.8:1 or better, stock counts 3.5:1 or better (large text) on their darkest pixel. **Sold-out seal:** a drink the bar stocked before (it is in the stock list) and now has none of shows a round NOT STOCKED seal in place of "In Stock: 0": two sepia rings, the name twice round the rim (`textPath` on one shared `#seal_rim` path in `management.html`, 10.5 px, decoration only), the project's anchor (`anchor.webp` as a mask) in the middle, tilted -8 deg and worn by `#rough`. Sepia 7.1:1 on the darkest paper under it; no red, so it asks the manager to look, not to act. A sr-only line says "Not stocked" (5 languages, `not_stocked`). Drinks the bar never carried (125 of the 191 catalogue rows) get the seal's dashed pair, the slot: the same 100 px ring and sepia ink, dashed, tilted +6 deg, a + over "CATALOGUE ONLY" in the seal's bold spaced caps (`catalogue_only`, 5 languages). The words are visible text, the + is decoration. Both replace "In Stock: 0", which read wrong for a catalogue the bar orders from.
- **Order receipt (F13):** after Place Stock Order the Your Order panel shows a receipt slip: "Stock order #NNNN" (running number, `localStorage` `STOCK_ORDER_NO`), date and time, one line per item, total, a note that delivery is booked with each supplier, and a worn ORDERED stamp. The slip is Paper 328 under a white wash (`--slip-wash`) with a zig-zag bottom and a drop-shadow on its wrapper. The stamp is deep green (`--stamp-green`, 3.1:1 or better on its worst pixel, ORDERED text 5.7:1), double-bordered with unequal widths, tilted -12 deg, ragged (static SVG filter `#rough`), worn by `stamp-wear.webp`, with two bites out of its border and a lighter press to the right. "Start a new order" is a plate button; the first new Add also clears the slip. The toast still says Order placed, and the live region reads the order number and total.
- **Stock stamps (F8):** LOW STOCK is a no-fill double-border stamp in `--stamp-red`, tilted -7 deg (plus 2 deg of jitter per card), worn with `stamp-wear.webp` at a different offset on each card. Hand-inked (V2 dry ink): the letters get a light ragged edge and a slight ink bleed; the frame is `::before` with a rough edge, uneven widths and dry-ink gaps, so the gaps never hit the letters (SVG filters `#ink-t1..4` and `#ink-b1..4` in `customer.html`, four seeds). The planned `--flag-red` gave 3.8:1 on the worn pixel, so the token is darker: 5.0:1 on hover, higher at rest. OUT OF STOCK is a bigger near-black stamp (`--ink-stamp`) across the greyed bottle, -20 deg, 16 px on phones. Both are real text.
- **Drink list (F8):** kelp-green board with random rust specks (one seamless 1024 px tile, `board-rust.webp`), a dark rim inside (`--list-edge`, `--shadow-well`), on the customer and management pages (one rule in `style.css`). Management rows keep their sea-glass cards until F12.
- **States:** hover darkens to 88 % brightness (150 ms in); pressing sinks the button 1 px, darkens to 80 % and shrinks the shadow to `--shadow-pressed`. No motion under reduced motion.
- **Landing (Deep Kelp to Abyss):** dark green gradient, white label, float shadow, 8 px corners. Used for "Order your Drinks!" and the staff login buttons.
- **Focus:** every control uses one two-tone ring: a 3 px Sail White outline plus a 6 px Ink halo (`outline: 3px solid #fff; box-shadow: 0 0 0 6px #000`). One of the two colours always reaches at least 4.58:1, on any surface.
- **Markup:** every control is a native `<button>` (since Phase 2); the 2018 `<div>`s inside `<a>` are gone.
- **Footer buttons** (Log Out, Place Order) fit their label with 24 px side padding, which leaves room for the Undo/Redo words.

### Tabs (drink categories)
- **Inactive:** a torn sailors' note (`tab-note1-3.webp`, cut from Texturelabs Paper 328) with a real torn top, fibre fringe and grime, sepia label, a soft drop shadow, tilted by under 1°. Neighbours use different cuts. 36 px tall; on hover it peeks up to 38 px.
- **Active:** a painted Sea Glass board (`board-surface.webp`, Poly Haven Green Rough Planks), 40 px tall, joined to the product area, black label 8.89:1.
- **Bartender:** wide notes (`tab-note-wide1-3.webp`) for its wider tabs; the active board is painted Weathered Copper (`board-surface.webp`) with a white label. "Update Orders" with new orders stays a solid Alarm Fill plate (5.88:1).
- Selected tab carries `aria-pressed="true"`.

### About and Passwords slips (landing page, 1280)
- Two torn slips of the same paper hang from the top edge, each held by a rusted nail head with a rust stain bleeding into the paper (`slip1-2.webp`). Vertical sepia label, 60x170 px, tilted -2° and 1.5°; on hover or focus they straighten and drop 4 px. Under 769 px they stay the labelled red and green bottom buttons.

- **Bartender order queue (F11):** the order panel is a card table: a wooden rail (14 px border, `--wood`) around green baize (`felt-green.webp`, vignette), with the three paper tabs lying on the rail (24 px overlap, torn bottoms from `tab-bottom1..3.webp` as masks, a dark contact patch under each; phones keep flat notes). Each order is a 244 x 330 px playing card on BnF 1850 stock (`card-face.webp`, luminance floor 0.43), 12 px radius, tilt of 0.5 degrees alternating. Cards lie in solitaire piles (grid of 72 px rows): "Waiting" piles of five, newest first, then one "Paid" pile of six (the Paid tab shows all paid, five to a pile). Only the 72 px band shows: red (waiting) or black (paid) number in Pirata One over a heart or spade, customer name, total as `495:-` (no "SEK"; the screen reader says "Total 495 kronor"), time (a 10 px Lucide clock at 60 % opacity before it marks it as a timestamp; decoration, hidden from screen readers), and a worn stamp (red NOT PAID, kelp PAID; the docket stamp adds "by <bartender>", or "with credit"). The bottom card of a pile also shows a big pip (hidden while that card is open, so the docket reads clean), paid cards a faint blue tax stamp (35 %). Pointing at a card lifts it 14 px. The top card of a pile (the one whose whole face shows) opens from anywhere on that face, not only the band: a transparent `::after` on its closed button reaches 258 px down to the card's bottom edge (Fitts's law); the cards under it keep the band. Clicking opens it in place: it grows to 284 px and lies over the cards below it, so nothing moves; the docket (lines in a 190 px list, total, Cancel and Mark as Paid, or "Paid by ...") opens by animating one grid row from 0fr to 1fr. One open card on the whole table (opening another closes it); a click on empty table (the baize or a group heading) or Esc closes it, and Esc returns focus to the card. Phones: one pile per row, an open card pushes the cards below it down. Reduced motion: no lift, no grow animation, a white outline marks the card. Worst-pixel contrast: name 6.28, total 6.62, number 6.11, time 5.55, worn red stamp 4.81, worn kelp stamp 4.78, docket 8.23, headings on the baize 7.59. Card text, stamps and headings are built in the chosen language and reprinted when the language changes. The state stamps (NOT PAID, PAID, and the docket's PAID by ...) are inked by hand like the stock stamps: the same four SVG filter pairs (inline in `bartender.html`), a tilt of -3 deg plus 1 or 2 deg of jitter per card, and a frame (`::before`) with a ragged edge, uneven ink and dry-ink gaps while the letters keep the 90 % ink wear mask. The docket's order list scrolls on a slim 5 px bar (2 px thumb) that lies in the card's margin, 4 px clear of the prices: faint at rest (`--scroll-faint`, 1.45:1 on purpose) and a neutral grey (`--scroll-thumb`, 3.3:1 on the card stock) when pointed at or focused; Firefox gets a thin bar in the same two greys, not the rope and mast of the page scrollbar. Cancel Order and Mark as Paid are hairline frames in the stamp inks (red 8.7:1, deep green 11:1), no plate, a faint tint on hover and a 1 px sink on press.
- **About window (F10):** one parchment sheet, `min(920px, 92vw)`, no inner scroll. Pirata One title, a 60-character lede, then three ruled columns (Try it, Built with, Crew; one column under 769 px) with plain sepia dashes as bullets and one small textured brass icon per heading (anchor, ship's wheel, skull and swords, `icons/about-*.webp`). Source link opens in a new tab with `rel="noopener"`. Copy is in all five languages; the crew names are not translated. Sepia 5.54:1 on the worst pixel; phones scroll the sheet itself (max 90 dvh).

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
- **Order panel (customer and management):** Deep Kelp, Seafoam heading and total, with Place Order at its foot. The header and the total bar are riveted iron plates (`rust.webp` and `iron.webp` multiplied over Deep Kelp, one `rivet.webp` in each upper corner of the header only) with a hemp cord (`rope.webp`, 14 px) along the edge towards the ledger. The textures only darken, so the text keeps 5.11:1 (heading), 5.32:1 (total label) and 6.81:1 (amount) on the lightest pixel.

### Inputs / Fields
- **Login fields:** browser-default text inputs inside a centred login box over a dark overlay. No custom focus or error styling.

### Navigation
- **Language flags:** five flag images in a row, 64x40 (true 1.6:1 ratio, 56x35 on phones) with 4 px corners and the Float shadow, which switch the interface language. The Pirate flag is also draggable for the Easter egg.
- **Mobile menu:** a white hamburger button replaces the tabs below 768 px; it opens on hover or keyboard focus.
- **Undo / Redo:** curved undo icons with a visible word from 1250 px up; icon-only below, with the word kept for screen readers.

### Scrollbars
- **Rope coil on a mast (F5):** every scroll area has a dark weathered-wood track (`mast.webp`, `--mast`) and a thumb of rope turns (`coil.webp`, `--rope`, `--shadow-coil`), 16 px wide, no arrow buttons. The thumb is 3.57:1 against the track. Chromium and Safari draw the textures; Firefox gets the two plain colours through `scrollbar-color`.

### Icons
- **Set:** Lucide line icons (ISC) from one local sprite, `img/icons.svg`, used as `<svg class="icon"><use href="img/icons.svg#name"/></svg>`. 2 px round strokes in `currentColor`, so an icon always takes its text colour. `.icon-2x` doubles the size for the menu and undo/redo buttons.
- **Meaning:** `trash` removes a drink from an order; `x` closes a dialog; `undo`/`redo`, `menu`, `alert` (login errors). Every icon is `aria-hidden`; its button carries the name.
- **Don't:** load an icon font or CDN, or use a letter (like "X") as an icon.

### Feedback (toast and announcements)
- **Toast (F9):** a burnt paper note pinned with a tack, sepia text (title 6.73:1, detail 6.60:1 on the worst pixel): a 20 px bold title and a 16 px detail line (`showToast(title, detail, isError)`; an empty detail is hidden). The icon is a 44 px wax seal (`seal-green.webp` done, `seal-red.webp` error, from Hassan's photo), errors add a worn red ribbon on the left edge. Low sea mist (`mist.webp`) drifts behind the open note on two feathered layers, one each way (40 s and 55 s), and never covers the text or catches clicks. Bottom centre above the footer, full width at the bottom under 768 px. Rises in with the transitions-dev toast motion (350 ms in, 250 ms out), stays 4 s + 60 ms per character, pauses while hovered. Reduced motion: no transitions, no drift. The mist is white over the page, so it also veils the bottom edge of anything under the note.
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
- **Don't** use Pirata One for prices, lists, labels or buttons.
- **Don't** put Ink text directly on the wood or storm backgrounds; use Sail White there.
- **Don't** add new one-off greens. Pick from the documented sea-glass and copper neutrals.
