# Texture plan (after V4)

Status 2026-10-30: V4 (tabs, slips, buttons, flags) is built and documented in `docs/audit-baseline.md` ("V4 done"). `npm test` is 115 green; the management axe test can time out under parallel load and passes alone. Nothing is committed. Hassan asked to plan more visual updates with his textures; this is the plan. The screenshots of the spots are in `docs/visual-options/next-spots.png`.

## Steps (order approved by Hassan 2026-10-30; T1 to T9 done, see "T1 done" to "T9 done" in `docs/audit-baseline.md`)

| Step | Spot | Today | Plan | Group |
|---|---|---|---|---|
| T1 | Small action buttons | management Add +1/+10/+100 and bartender Mark as Paid are flat gold, Cancel is flat red, TOTAL is a grey box | brass plate without rivets (`.light_green`, `.add_button`), rust-red plate for `.red` danger, iron for TOTAL; same hover and pressed states | V4 |
| T2 | Phone category menu (customer, under 769 px) | blue border (`--accent-blue`), black separators that run past the menu, plain white list | paper list from Paper 328, active item on the board | V4 / V6 |
| T3 | About and Passwords windows | 50 % red and green sheets; the logo and "Order your Drinks!" show through the text | nailed parchment with sepia text, matching the slips | V7 |
| T4 | Login box | `wood3.jpg` (licence unknown, a 4th wood); "Order your Drinks!" shows under the box (layout bug) | planks with iron corners; fix the overlap | V7 |
| T5 | Landing signs | "Order your Drinks!" and the small, faint staff logins (kelp gradient) | iron or brass signs on the storm | V7 |
| T6 | Staff nameplate | "Bartender: Bart" and "Manager: Mana" clipped in a grey box | riveted brass nameplate with the full name | V6 |
| T7 | Order panel | flat Deep Kelp, blank when empty | ledger page, plus a "nothing ordered yet" note | V5 / V13 |
| T8 | Bartender open order | white drink square, plain button row | paper docket | V5 |
| T9 | Toasts | Deep Kelp pills | small pinned notes | V12 / V13 |

Assets that would help T3 to T5 (ask Hassan): burnt-edge parchment, wax seal, rope, dark planks.

## Process (unchanged)

Explain the existing code, offer 2-3 options with the recommended one first, put mockup PNGs in `docs/visual-options/`, send them, and ask with AskUserQuestion. Hassan decides, Claude codes. Measure contrast on the worst pixel with the text hidden. Keep the rules: tokens in `:root` only, `var(--shadow-*)` and `var(--radius-*)`, transitions-dev motion tokens with a reduced-motion guard, labels in 5 languages, CRLF in `js/management.js`, axe 0 violations, 24 px targets (44 on phones), no sideways scroll at 320/375. Commit only when Hassan asks. Do not start step 6 (case study).

## Tools (`tools/textures/`)

Run from the project root; they read Hassan's raw files in `/home/hassan/Downloads/Textures` (never commit those).
- `gentex4.py`: torn notes (`python3 tools/textures/gentex4.py`) and slips (`... slips`); `floor_lum()` lightens label zones.
- `gentex5.py`: rivet and rusted nail from Details 141/144.
- `floorfix.py`: re-applies the label floor (0.31) to the final WebPs.
- `contrast.js`: worst-pixel contrast; needs an options module of injected CSS (`node tools/textures/contrast.js <out-dir> <options.js>`).
- `screens.js`: screenshots of all views (`node tools/textures/screens.js <out-dir> 1280`).

The intermediate scripts ended up named `v4h`/`v4i`/`v4j`, and some paths in the copied scripts (output names, `img/textures/` file names from before the rename) may need adjusting before reuse.
