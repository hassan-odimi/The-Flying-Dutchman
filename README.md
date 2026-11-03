<div align="center">

# The Flying Dutchman · v2

**A pirate-bar ordering system, rebuilt for keyboards, screen readers and phones.**

**Version 2 · designed, directed and tested by [Hassan Odimi](https://TODO-hassan-odimi.se)**

![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-1f6f5c)
![Stack: HTML, CSS and jQuery, no framework](https://img.shields.io/badge/HTML%20%C2%B7%20CSS%20%C2%B7%20jQuery-no%20framework-555)

<a href="https://the-flying-dutchman.hassan-odimi.workers.dev/"><img src="docs/readme/hero.webp" alt="The Flying Dutchman landing page: an aged-parchment ship logo in a green storm, a brass Order your Drinks sign and five tattered language flags" width="760"></a>

**[Live demo](https://the-flying-dutchman.hassan-odimi.workers.dev/)** &nbsp;·&nbsp; [Case study](https://TODO-hassan-odimi.se)

</div>

## At a glance

<table align="center">
  <tr>
    <td align="center"><b>587 to 0</b><br>accessibility<br>violations</td>
    <td align="center"><b>320 px</b><br>smallest screen,<br>no sideways scroll</td>
    <td align="center"><b>5</b><br>languages,<br>pirate included</td>
    <td align="center"><b>480</b><br>automated<br>test runs</td>
  </tr>
</table>

## Three roles, one ship

<p align="center"><b>Customer</b> · browse, order, pay with credit<br><img src="docs/readme/role-customer.webp" alt="Customer view: torn-parchment drink cards with Out of stock and Low stock stamps, and an order panel with four drinks totalling SEK 250" width="760"></p>

<p align="center"><b>Bartender</b> · serve the queue, mark orders paid<br><img src="docs/readme/role-bartender.webp" alt="Bartender view: orders as playing cards on green felt, hearts for waiting and spades for paid, with Not paid and Paid stamps" width="760"></p>

<p align="center"><b>Manager</b> · restock, manage specials<br><img src="docs/readme/role-management.webp" alt="Manager view: drink catalogue on parchment strips with Add +1, +10 and +100 buttons and a stock order panel" width="760"></p>

## Before and after

<table align="center">
  <tr>
    <th align="center">v1 · 2018</th>
    <th align="center">v2 · 2026</th>
  </tr>
  <tr>
    <td align="center"><img src="docs/readme/customer-before.png" alt="2018 customer view: flat grey-green panels on stock wood, an empty order panel and plain flag images" width="440"></td>
    <td align="center"><img src="docs/readme/customer-after.webp" alt="2026 customer view: torn-parchment tabs and drink cards, an order panel, a rope of flags and a brass credit coin" width="440"></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/readme/phone-before.png" alt="2018 customer view at phone width: one drink per row on grey cards, a red Log Out button and the flags below the order bar" width="170"></td>
    <td align="center"><img src="docs/readme/phone-after.webp" alt="2026 customer view at phone width: two parchment drink cards per row, the credit coin, and the order total with Place Order in a bar at the bottom" width="170"></td>
  </tr>
</table>

## What I changed

| Area | Result |
|---|---|
| **Accessible** | You can order, serve and restock by keyboard alone. Screen readers announce each change to the order with its new total. 0 axe violations in all 4 views. |
| **Phone-ready** | The manager view had no viewport tag, so phones shrank it to 0.38×. It now fits 320 px. Touch targets are 24 px or more. |
| **Themed** | 143 hard-coded colours became named colour tokens. Wood, parchment, rope and brass textures replace the flat panels. |
| **Feedback** | 11 `alert()` pop-ups became toasts and live regions. |
| **Haunted** | Fog, wind and ghost effects with sound cues. Sound is off by default. Reduced motion gets plain fades. |
| **Tested** | 234 Playwright tests in Chromium and Firefox, plus 12 phone tests, with axe and a virtual screen reader. |

## Try it

```bash
python3 -m http.server 8080   # open http://localhost:8080
```

Open **Get the passwords** on the landing page for demo logins. To run the tests:

```bash
npm install && npx playwright install && npm test
```

## Credits

- **v2 (2026):** Hassan Odimi. Design, polish, tests and docs.
- **v1 (2018):** Hassan Odimi, Mauro José Pappaterra, Jenny Olsson, Yawen Yi and Elsa Slättegård, for Interface Design I at Uppsala University.

[Design system](DESIGN.md) · [Audit numbers](docs/audit-baseline.md) · [Asset licences](docs/ASSETS.md)
