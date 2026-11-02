<div align="center">

# 🏴‍☠️ The Flying Dutchman · v2

**A pirate-bar ordering system, rebuilt for everyone, every screen and every mood.**

**Version 2 · designed, built and tested by [Hassan Odimi](https://TODO-hassan-odimi.se)**

![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-1f6f5c)
![axe violations](https://img.shields.io/badge/axe--core%20violations-0-1f6f5c)
![Languages](https://img.shields.io/badge/languages-5-8a6a2b)
![Stack](https://img.shields.io/badge/HTML%20%C2%B7%20CSS%20%C2%B7%20JS-no%20framework-555)

<a href="https://TODO-hassan-odimi.se"><img src="docs/readme/hero.png" alt="The Flying Dutchman landing page: a white ship logo over a green storm, a brass Order your Drinks sign and five language flags" width="760"></a>

**[▶ Live demo](https://TODO-hassan-odimi.se)** &nbsp;·&nbsp; [v1 (2018)](http://www.engpappa.com/dutchman/) &nbsp;·&nbsp; [Case study](https://TODO-hassan-odimi.se)

</div>

<br>

## At a glance

<table align="center">
  <tr>
    <td align="center"><h3>587 → 0</h3>accessibility<br>violations</td>
    <td align="center"><h3>320 px</h3>smallest screen,<br>no sideways scroll</td>
    <td align="center"><h3>5</h3>languages,<br>pirate included</td>
    <td align="center"><h3>470+</h3>automated<br>tests</td>
  </tr>
</table>

<br>

## Before → after

<table align="center">
  <tr>
    <th align="center">v1 · 2018</th>
    <th align="center">v2 · 2026</th>
  </tr>
  <tr>
    <td align="center"><img src="docs/readme/customer-before.png" alt="2018 customer view: flat grey-green panels on stock wood" width="440"></td>
    <td align="center"><img src="docs/readme/customer-after.png" alt="2026 customer view: parchment tabs, bottle cards, a rope with flags and a brass credit coin" width="440"></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/readme/phone-before.png" alt="2018 customer view at phone width" width="170"></td>
    <td align="center"><img src="docs/readme/phone-after.png" alt="2026 customer view at phone width" width="170"></td>
  </tr>
</table>

<br>

## What I changed

| | Area | Result |
|:-:|---|---|
| ♿ | **Accessible** | Whole order flow works by keyboard. Every action is announced to screen readers. WCAG 2.2 AA, 0 axe violations. |
| 📱 | **Phone-ready** | Manager view no longer shrinks to 0.38×. Touch targets 24 px or more. |
| 🎨 | **Pirate, but crafted** | 42 colour tokens replace 143 hard-coded colours. Wood, parchment, rope and brass textures. |
| 💬 | **Feedback** | 10 `alert()` pop-ups became toasts and live regions. |
| 👻 | **Haunted** | Fog, wind and ghost effects with sound cues. Sound is off by default. Reduced motion gets plain fades. |
| 🧪 | **Tested** | 470+ Playwright tests in Chromium and Firefox, with axe and a virtual screen reader. |

<br>

## About the app

Three roles in one static site: **customer** (browse, order, pay with credit), **bartender** (serve, mark paid), **manager** (stock, specials, supply orders). No framework.

**The haunting:** drink cards condense out of a smoke skull on first load, tab switches leave spectral echoes, pages sink into fog, flags and paper slips sway in a draught. Every effect ends within 5 seconds.

<br>

## Try it

```bash
python3 -m http.server 8080   # open http://localhost:8080
npm install && npm test       # optional: run the tests
```

Open **Get the passwords** on the landing page for demo logins. Easter egg: drag the pirate flag onto the ship.

<br>

## Credits

- **v2 (2026):** Hassan Odimi. Every design decision, the polish, the tests and the docs. Coded with Claude Code under my direction; accessibility checked with [axe-core](https://github.com/dequelabs/axe-core).
- **v1 (2018):** Mauro José Pappaterra, Jenny Olsson, Hassan Odimi, Yawen Yi and Elsa Slättegård, for Interface Design I at Uppsala University.

[Design system](DESIGN.md) · [Product brief](PRODUCT.md) · [Audit numbers](docs/audit-baseline.md) · [Asset licences](docs/ASSETS.md)
