# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (2026):** portfolio reviewers, such as recruiters and UX leads, who open the live demo as part of Hassan Odimi's case study. They must understand and try every role within about two minutes, without instructions from a person.
- **In-app roles (the fiction the demo serves):**
  - **Customer:** a guest at the bar who browses drinks, builds an order, and pays with account credit. VIP customers have credit; non-VIP customers do not.
  - **Bartender:** serves incoming orders, sees order details, and handles stock.
  - **Manager:** monitors stock and shortages, manages special drinks, and places supply orders.

## Product Purpose

The Flying Dutchman is an ordering system for a fictitious pirate-themed bar. It was built in 2018 for the Interface Design I (User Interface Programming I) course at Uppsala University by a group of five. The 2026 polish turns it into a portfolio case study: the same product and identity, with improved accessibility, interaction feedback, and mobile use.

Success means:
- Zero axe-core violations (WCAG 2.2 AA tags) on all four views, and a full order flow that works with the keyboard alone.
- Every add, remove, undo/redo, payment, and error gives visible feedback that is also announced to assistive technology.
- Customer ordering works at 375 px width with touch targets of at least 24 px.
- Before/after screenshots and scan numbers are documented for hassan-odimi.se.

## Operating Context

- One static site with four views: `index.html` (landing page and login), `customer.html`, `bartender.html`, `management.html`.
- Data is dummy JavaScript arrays in `db/` (`DB.js` users and orders, `DB_SYSTEMBOLAGET.js` drinks, `DB_MIKES.js` specials). State persists in `localStorage`.
- Visitors try roles with the demo credentials in the "Get the passwords" panel on the landing page.
- Original online version: http://www.engpappa.com/dutchman/

## Capabilities and Constraints

- **Stack is fixed:** plain HTML, CSS, and JavaScript with jQuery 3.2.1. No frameworks, as the course required. This keeps the before/after comparison honest.
- **Five languages:** English, Swedish, Italian, Spanish, and Pirate. The texts live in `js/view/view_*.js`, indexed [0] to [4]. Every new visible label and every accessible name or ARIA text needs all five.
- **Existing features to keep:** login per role, drink browsing and filtering, order building, undo/redo, drag and drop, the order queue for bartenders, and stock and specials management.
- **Demo logins panel:** keep it. Polish it in a later phase.
- **Flag-drag Easter egg:** keep it (drag the pirate flag onto the ship). Polish it in a later phase. It currently plays a hot-linked 9gag video, which is an external dependency at risk.

## Brand Commitments

- Name: The Flying Dutchman. The team signs itself "Pirates of the Caribbean".
- The pirate theme is binding: keep the identity and improve it. Any new assets must be free or Creative Commons licensed, from reliable sources, with the source and license recorded.
- Voice: playful pirate flavour, with full pirate speak in the Pirate language option.
- Existing assets: the ship logo (`img/logo/`), the storm and wood backgrounds (`img/`), the language flags, and the drink images (`img/drinks/`).

## Evidence on Hand

- Group members: Mauro José Pappaterra, Jenny Olsson, Hassan Odimi, Yawen Yi, Elsa Slättegård.
- The 2018 implementation and its git history (473 commits).
- No user testing data, metrics, or testimonials exist. Do not fabricate any.

## Product Principles

1. **Refine, don't replace:** the 2018 product and identity stay recognisable, so the before/after reads clearly.
2. **Every action answers back:** state changes are visible and announced, never silent.
3. **Accessible in every language:** an accessibility fix is not done until it works in all five languages.
4. **Self-explanatory demo:** a reviewer can reach and use every role without outside help.

## Accessibility & Inclusion

- Standard: WCAG 2.2 AA.
- Verified with axe-core 4.10.2 in the browser, plus manual keyboard and screen-reader walkthroughs.
- All motion respects `prefers-reduced-motion`.
