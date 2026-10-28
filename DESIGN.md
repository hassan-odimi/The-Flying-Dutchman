---
name: The Flying Dutchman
description: Pirate tavern ordering system with sea-glass panels on dark wood.
colors:
  sea-glass: "#a4b9b6"
  pale-sea-glass: "#c0cfcc"
  seafoam: "#96b9a5"
  weathered-copper: "#567973"
  deep-kelp: "#254540"
  abyss: "#0c2924"
  brass-doubloon: "#aa8139"
  brass-doubloon-deep: "#84642b"
  rum-red: "#ad2535"
  rum-red-deep: "#8e1f2c"
  alarm-red: "#ff2d1b"
  ink: "#000000"
  sail-white: "#ffffff"
typography:
  display:
    fontFamily: "'Berkshire Swash', cursive"
    fontSize: "2rem"
    fontWeight: 700
  headline:
    fontFamily: "'Oswald', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
  body:
    fontFamily: "'Oswald', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "'Oswald', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
rounded:
  xs: "2px"
  sm: "5px"
  md: "7px"
  tab: "10px 10px 0 0"
spacing:
  xs: "3px"
  sm: "10px"
components:
  button-primary:
    backgroundColor: "{colors.brass-doubloon}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px"
  button-danger:
    backgroundColor: "{colors.rum-red}"
    textColor: "{colors.ink}"
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
    rounded: "{rounded.tab}"
    padding: "{spacing.xs}"
  tab-inactive:
    backgroundColor: "{colors.weathered-copper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tab}"
    padding: "{spacing.xs}"
  card-drink:
    backgroundColor: "{colors.pale-sea-glass}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  panel-order:
    backgroundColor: "{colors.deep-kelp}"
    textColor: "{colors.seafoam}"
---

# Design System: The Flying Dutchman

<!-- Documented from the 2018 implementation on 2026-10-28, before the polish. Values describe the incumbent system, not targets. -->

## Overview

**Creative North Star: "The Captain's Tavern"**

A warm wooden bar on a pirate ship. Dark wood planks (`img/wood2.jpg`) cover the background of the working views. Sea-glass green panels sit on top like frosted portholes, with brass and rum-red fittings for the actions that matter. The storm (`img/storm.jpg`) and the white ship logo belong to the landing page only: the storm stays outside, and inside the tavern it is cosy and hospitable.

The working views (customer, bartender, management) are tools first. The theme lives in materials (wood, sea glass, brass), in the swash display font, and in the Pirate language option. Layout and controls follow familiar patterns: tabs over a product grid, an order panel on the right, and primary and danger buttons at the bottom.

**Key Characteristics:**
- Dark wood texture under every working view; storm photo on the landing page.
- Cool sea-glass greens for surfaces, warm brass and rum red for actions.
- Berkshire Swash for greetings and titles, Oswald for everything else.
- Heavy black shadows that make panels look carved and raised.

## Colors

Cool, desaturated sea greens for surfaces, with two warm metals saved for actions.

### Primary
- **Brass Doubloon** (gradient from brass-doubloon to brass-doubloon-deep): the main action, such as Place Order and confirm buttons. It is the warmest, brightest thing on screen.

### Secondary
- **Rum Red** (gradient from rum-red to rum-red-deep): destructive or exit actions, such as Log Out and remove.

### Neutral
- **Sea Glass**: the active category tab, joined to the product area beneath it.
- **Pale Sea Glass**: drink cards and the main product area.
- **Weathered Copper**: inactive tabs and secondary list rows.
- **Deep Kelp**: the order and checkout panel, and the top of the landing-page button gradient.
- **Abyss**: the darkest green, used for the bottom of the landing-page gradient and the bartender panel borders.
- **Seafoam**: headings and totals on Deep Kelp panels.
- **Ink**: body text on sea-glass surfaces and button labels.
- **Sail White**: display headings and text on the wood and storm backgrounds.

### Feedback
- **Alarm Red**: stock alerts and warnings in the management and bartender views.

### Named Rules
**The Two Metals Rule.** Warm colour means action. Brass is for the primary action and Rum Red for leaving or destroying. Surfaces never use either metal.

## Typography

**Display Font:** Berkshire Swash (with cursive)
**Body Font:** Oswald (with sans-serif)
**Label/Mono Font:** Consolas, Menlo, Courier (monospace), used only in the bartender order details.

**Character:** A hand-painted tavern sign over a condensed, sturdy working face. The swash brings the pirate voice; Oswald keeps dense lists of drinks and orders scannable.

### Hierarchy
- **Display** (700, 2rem): greetings and page titles, such as "Hello John!", in Sail White over wood.
- **Headline** (700, 1.5rem): panel titles such as "Your Order", in Seafoam.
- **Body** (400, 1rem): drink names, prices, list rows.
- **Label** (400, 1.25rem): button text.

### Named Rules
**The One Swash Rule.** Berkshire Swash appears once per view, for the greeting or title. Everything a user must read quickly is Oswald.

## Layout

Fluid, percentage-based layout with no fixed grid. On desktop, the customer view is two columns: the tabbed drink grid on the left (about two thirds) and the order panel on the right. Action buttons and language flags sit in a bottom bar. Under 768 px the columns stack, the category tabs collapse into a hamburger menu, and the drink grid becomes a single column of wide cards.

Breakpoints in the code: 414 px (phones) and 768 px (tablets). Spacing is ad hoc: percentages for margins, and small pixel values (3 px, 10 px) inside controls.

## Elevation & Depth

Depth comes from heavy, pure-black shadows, not from tonal layering. Panels and tabs look raised off the wood like carved pieces.

### Shadow Vocabulary
- **Tab lift** (`box-shadow: 2px -2px 10px black, 2px 0 10px black`): category tabs, which cast shadow upward onto the wood.
- **Plank** (`box-shadow: 5px 5px 30px black`): large panels such as the order area.
- **Button float** (`box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2)`): primary and danger buttons.
- **Halo** (`box-shadow: 2px 2px 10px black, -2px -2px 10px black`): landing-page buttons, which glow dark on all sides.

### Named Rules
**The Carved Wood Rule.** Every surface on the wood background has a shadow. A panel without one looks pasted on.

## Shapes

Mostly softly squared. Buttons use 2 to 5 px corners, landing buttons 7 px, and category tabs round only their top corners (10 px) so they join the panel below like file tabs. Some legacy radii are percentages (1 to 4 %), which bend unevenly as boxes resize.

## Components

### Buttons
Sturdy and tactile, like brass fittings on a bar.
- **Shape:** gently squared (5 px; 2 px on large bottom-bar buttons).
- **Primary (Brass Doubloon):** vertical brass gradient, black Oswald label, button-float shadow.
- **Danger (Rum Red):** same shape with the rum-red gradient.
- **Landing (Deep Kelp to Abyss):** dark green gradient, white label, halo shadow, 7 px corners. Used for "Order your Drinks!" and the staff login buttons.
- **Hover / Focus:** no consistent hover or focus treatment exists yet. Several buttons are `<div>`s inside `<a>` elements with no `href`.

### Tabs (drink categories)
- **Active:** Sea Glass, joined to the product area.
- **Inactive:** Weathered Copper.
- Top corners rounded (10 px), tab-lift shadow, 3 px padding.

### Cards / Containers
- **Drink card:** Pale Sea Glass, with the bottle image above the name and price in black Oswald. Percentage corners (3 %), no shadow.
- **Order panel:** Deep Kelp, Seafoam heading and total, with Place Order at its foot.

### Inputs / Fields
- **Login fields:** browser-default text inputs inside a centred login box over a dark overlay. No custom focus or error styling.

### Navigation
- **Language flags:** five flag images in a row, which switch the interface language. The Pirate flag is also draggable for the Easter egg.
- **Mobile menu:** a white hamburger icon replaces the tabs below 768 px.

### Bartender order accordion (signature)
Each order is a `<button class="accordion">` row showing the order number and customer. It expands with a 0.2 s `max-height` ease-out to show items and actions.

## Do's and Don'ts

### Do:
- **Do** keep the wood texture under working views and the storm on the landing page only.
- **Do** use Brass Doubloon for the single primary action in a view and Rum Red for exit or destructive actions.
- **Do** set panel headings in Seafoam on Deep Kelp, and body text in Ink on sea-glass surfaces.
- **Do** give every raised surface on the wood a black shadow from the vocabulary above.

### Don't:
- **Don't** use brass or red for surfaces or decoration; they mean action.
- **Don't** use Berkshire Swash for prices, lists, labels or buttons.
- **Don't** put Ink text directly on the wood or storm backgrounds; use Sail White there.
- **Don't** add new one-off greens. Pick from the six sea-glass neutrals.
