# Assets: sources and licences

Every image, font and library the app uses, with what is known about where it came from. Recorded 2026-10-29 during the visual polish (V10). The 2018 team recorded no sources, and the image files carry no metadata that names one, so "unknown" below means exactly that. Nothing here has been replaced; new assets must be free or Creative Commons, with source and licence added to this file (PRODUCT.md).

## Images in `img/`

| File | Used on | Source | Licence |
|---|---|---|---|
| `logo/aged.webp` | landing page ship logo (since V9), the face of the easter-egg button | the 2018 logo below, filled with Texturelabs Paper 328 and lightly worn with InkPaint 128 and 315 (`tools/textures/gentex11.py`) | logo team's own work; textures Texturelabs licence |
| `logo/ghost-ship.webp` | easter egg: shown when the pirate flag is dropped on the logo, or the logo is pressed | Louis M. Eilshemius, *The Flying Dutchman*, 1908, Whitney Museum; Wikimedia Commons `File:Louis Michel Eilshemius The Flying Dutchman.gif` (391 x 360), converted by `gentex11.py` | public domain |
| `favicon.png` | browser tab, all pages | 2018 team, same ship logo | team's own work |
| `storm.jpg` | landing page background | unknown; the photo carries an artist signature, "Ernest T." | unknown, not cleared |
| `wood2.jpg` | background of customer, bartender and management, and the login box | unknown stock texture | unknown, not cleared |
| `icons.svg` | interface icons, all pages (menu, undo, redo, trash, x, check, alert; beer and ship-wheel for the staff label, T6; chevron-down on the bartender order bar, T8; cross-brush, the order-row remove mark, V5; crown, user, flask-conical and log-in for the demo logins, V8) | [Lucide](https://lucide.dev) icon paths, copied into one sprite in V11; cross-brush drawn in `tools/textures/brush.py` | ISC; cross-brush ours |
| `tools/textures/src/`: `eng.webp`, `sve.webp`, `ita.webp`, `esp.webp` | not served since V7 (moved out of `img/`); source files for the cloth flags (`tools/textures/gentex10.py`) | unknown image files; the flag designs themselves are national symbols in the public domain | file source unknown |
| `tools/textures/src/white3.png` | not served since V9 (moved out of `img/`); source file for `logo/aged.webp` | 2018 team's own logo (Pirates of the Caribbean group) | team's own work |
| `tools/textures/src/pirate.webp` | not served since V7 (moved out of `img/`); source file for the cloth pirate flag, which now carries the drag easter egg | unknown; the original JPEG was edited in Photoshop CC 2015 on 2018-03-26 (EXIF) | unknown, not cleared |
| `drinks/*.webp` (207 files) | drink cards, order rows, bartender order details | product photos; the file names are Systembolaget article numbers matching `db/DB_SYSTEMBOLAGET.js` | third-party product photos, rights with the producers or Systembolaget; not free. Used only in this non-commercial student demo |

### Textures in `img/textures/` (V4)

Cut, toned and resized derivatives only (300 KB in all). The raw source files are not in the repository and must not be added: the Texturelabs licence allows use inside a project but not redistribution of the files themselves, and the Unsplash licence does not allow the photos to be offered as stock again.

| File | Used on | Source | Licence |
|---|---|---|---|
| `tab-note1-3.webp`, `tab-note-wide1-3.webp` | inactive tabs, all three working views | [Texturelabs](https://texturelabs.org) Paper 328, cropped; torn top edge traced from Texturelabs Paper 215 | Texturelabs licence: use in projects allowed, no redistribution of the raw files |
| `slip1.webp`, `slip2.webp` | About and Passwords slips, landing page | Texturelabs Paper 328 (paper), Paper 215 (torn edges), Details 144 (rusted nail head) | Texturelabs licence, as above |
| `rivet.webp` | corner rivets on the brass buttons and the landing signs; nails on the About and Passwords windows | Texturelabs Details 144, head cut out | Texturelabs licence, as above |
| `tarnish.webp` | brass buttons (multiply layer) | Texturelabs Metal 132, greyscale | Texturelabs licence, as above |
| `rust.webp` | small plates: Add, Mark as Paid, Cancel Order, TOTAL (multiply layer) | Texturelabs Metal 132, colour, 70 % | Texturelabs licence, as above |
| `paper-list.webp` | phone category menu and order ledger, customer; About and Passwords windows, landing | Texturelabs Paper 328, cropped, lightened to a 0.33 luminance floor | Texturelabs licence, as above |
| `iron-frame.webp` | iron corner brackets on the login box (`border-image`) | Texturelabs Metal 155, greyscale toned; rivets from `rivet.webp` | Texturelabs licence, as above |
| `iron.webp` | Close buttons and the staff login signs (multiply layer) | Texturelabs Metal 155, greyscale | Texturelabs licence, as above |
| `tack.webp` | the tack pinning the toast | Texturelabs Details 141, cut out | Texturelabs licence, as above |
| `stamp-wear.webp` | wear mask on the NOT PAID / PAID stamps (90 % ink or more), the toast icon and its red error ribbon | Texturelabs InkPaint 128, greyscale to alpha | Texturelabs licence, as above |
| `note.webp` | toast note, all pages (`border-image`, 9-slice so the burnt rim keeps its size) | Texturelabs Paper 329, inner area lightened to a 0.36 luminance floor (`tools/textures/gentex8.py`) | Texturelabs licence, as above |
| `strike.svg` | brush strike over an order row while its remove cross is hovered or focused (mask) | drawn in `tools/textures/brush.py` | ours |
| `mist.webp` | low sea mist under an open toast (F9), 1400 x 300, tiles in X | Texturelabs Atmosphere 142, crop (0, 1300, 4240, 3121), greyscale to white alpha with `a = min(255, 1.5 * v^0.9)`, last 200 px crossfaded over the first 200 (`gentex12.py`) | Texturelabs licence, as above |
| `seal-red.webp`, `seal-green.webp` | toast icons, error and done (F9) | [photo 21VlmPMZEtw](https://unsplash.com/photos/21VlmPMZEtw) by Paolo Chiabrando on Unsplash, the wax seal cut out by colour, holes filled, imprint sharpened, 160 x 160; green is a hue shift of the red (`gentex12.py`) | Unsplash licence, as above |
| `icons/about-anchor.webp`, `icons/about-wheel.webp`, `icons/about-skull.webp` | one icon before each About column heading (F10), 96 x 96 alpha shown at 24 px | The silhouette of the project's anchor drawing (`anchor.png`), of the ship's wheel (`rudder.png`, outline kept dark inside a filled silhouette) and of the skull and crossed swords on `flag-pirate.webp`, filled with dark brass toned from Texturelabs Metal 155, 1 px bevel (`gentex12.py`) | Project assets and Texturelabs licence, as above; the raw PNGs stay out of the repo |
| `coin.webp` | gold cob coin on the customer credit label | Texturelabs Details 141 (the metal disc), toned to gold, uneven cob edge and a worn cross struck in (`tools/textures/gentex9.py`) | Texturelabs licence, as above |
| `rope.webp` | hemp cord of the flag line, app footers | [photo cEWREu21dmU](https://unsplash.com/photos/cEWREu21dmU) by Thomas Kinto on Unsplash, a strip keyed off its black ground, shrunk to cord thickness, tiled and bent into the sag (`gentex9.py`) | [Unsplash licence](https://unsplash.com/license): free use and changes, no resale as stock |
| `mast.webp`, `coil.webp` | scrollbar track and thumb, every page | `mast.webp`: a strip of Texturelabs Wood 131 with cylinder shading. `coil.webp`: pieces of `rope.webp` tilted and stacked, lightened so the thumb is 3.57:1 against the track (`gentex12.py`) | Texturelabs licence, as above; rope as `rope.webp` |
| `plate-worn.webp` | Log Out, Undo, Redo plates (F6) | Texturelabs Metal 155 iron face (colour 0.45, tone-mapped, then 0.92 brightness so white is 5.5:1 at rest and 4.58:1 on hover), Metal 132 rust rim, chipped outline, light top bevel (`gentex12.py`, seed 11) | Texturelabs licence, as above |
| `bolt.webp` | Close X (F6) | Texturelabs Details 141 crop, brightness 0.6, multiplied by Metal 132 rust, round alpha (`gentex12.py`) | Texturelabs licence, as above |
| `icons/anchor.webp` | Undo and Redo icon, used as a CSS mask (F6) | The project's own anchor drawing (`anchor.png`, rounded stock), scaled to 128 x 128 alpha (`gentex12.py`) | Project asset; the raw PNG stays out of the repo |
| `card-paper1..4.webp` | customer drink cards (F8), assigned by `:nth-child(4n+...)` | Texturelabs Paper 328, four crops, 400 x 600 with alpha: a torn top, a nicked corner, a V-tear in the side, a worn fold; light stains, pale fibre fringe, brightness lift in the bottom band so the stamp ink reads (`gentex12.py`, seeds 801-804) | Texturelabs licence, as above |
| `row-paper1..4.webp` | management drink rows (F12), assigned by `:nth-child(4n+...)` from 1280 px wide; narrower layouts use `card-paper1` and `card-paper4` | Texturelabs Paper 328, four crops, 1200 x 200 with alpha: a long torn top, a nicked corner, a V-tear in the bottom edge, a worn fold; light stains, pale fibre fringe, floor at luminance 0.40 so sepia and the red stock count read (`gentex12.py`, seeds 901-904) | Texturelabs licence, as above |
| `card-face.webp` | bartender order cards (F11), 600 x 900 | "French Portrait card deck - 1850", Bibliothèque nationale de France, Gallica `btv1b10527601s`, engraver Nicolas-Marie Gatteaux, via Wikimedia Commons: the clean lower part of the Ace of Hearts with its faint watermark, mirrored to fill (`gentex12.py`) | Public domain (BnF scan of a work from 1850) |
| `pip-heart.webp`, `pip-spade.webp` | corner index and big centre pip of the order cards (F11), 128 x 128 alpha | the engraved heart and spade of the same deck's Ace of Hearts and Ace of Spades, cut by ink threshold, the scan's ink colour kept (`gentex12.py`) | Public domain, as above |
| `tax-stamp.webp` | blue tax stamp on paid order cards, 35 % opacity (F11), 220 px wide alpha | the "République Française" stamp of the same deck's Ace of Clubs, alpha from blue minus red (`gentex12.py`) | Public domain, as above |
| `felt-green.webp` | the bartender's card table baize (F11), 512 x 512 seamless | [ambientCG Fabric 034](https://ambientcg.com/view?id=Fabric034), CC0, greyscale, autocontrast, tinted `#0b2a1c` to `#2f6a4c`, 25 % Texturelabs Atmosphere 133 wear stains mirrored 2 x 2 (`gentex12.py`) | CC0 (ambientCG); stains Texturelabs licence, as above |
| `tab-bottom1..3.webp` | torn bottom edge of the three bartender tabs, mask (F11), 920 x 80 alpha | each `tab-note-wide1-3.webp`'s own torn top, flipped and mirrored (`gentex12.py`) | ours |
| `nail.webp` | rusty nail heads holding the cord, app footers | [photo U_Ytvt1eTfM](https://unsplash.com/photos/U_Ytvt1eTfM) by Ian Talmacs on Unsplash, one head cut out and domed with a light from the top left (`gentex9.py`) | Unsplash licence, as above |
| `flag-eng/sve/ita/esp/pirate.webp` | cloth flags of the flag line, app footers | our flag files above, woven with Texturelabs Paper 214, folded, faded, stained with Wood 131 and torn at the fly (`tools/textures/gentex10.py`) | flag designs public domain; textures Texturelabs licence |
| `board-surface.webp`, `board-kelp.webp` | active tab board | [Poly Haven](https://polyhaven.com/a/green_rough_planks) Green Rough Planks by Rob Tuytel, toned to Sea Glass and Weathered Copper | CC0 |

The label areas of the paper files were lightened where needed so sepia text keeps 5:1 on their darkest pixel; `tests/textures.spec.js` checks this on the files. `docket.webp` and `torn-edge.webp` (T8, `tools/textures/gentex7.py`) were removed in F11, the cards replace them.

The drink photos were converted in V10 from PNG (up to 4002 px tall, 48.5 MB) to WebP, 400 px tall at most, quality 82 (2.5 MB). The original PNGs remain in git history before that change.

The flags were cut in V11 from 1200x750 PNG/JPEG (260 KB) to 128x80 WebP, twice their 64x40 display size (7.3 KB). The originals remain in git history.

## Hot-linked media

| What | Where | Source | Licence |
|---|---|---|---|
| Easter egg video and poster | was `index.html` `#great` | hot-linked from `img-9gag-fun.9cache.com` | removed in V9, replaced by `logo/ghost-ship.webp` (public domain) |

## Fonts and libraries (loaded from CDNs)

| What | Source | Licence |
|---|---|---|
| Alegreya Sans (400, 500, 700) | Google Fonts | SIL Open Font License 1.1 |
| Pirata One (400) | Google Fonts | SIL Open Font License 1.1 |
| jQuery 3.2.1 | ajax.googleapis.com | MIT |
| axe-core 4.10.2 (tests only) | cdnjs | MPL 2.0 |
