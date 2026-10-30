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
| `docket.webp` | bartender order bars and the open-order docket | Texturelabs Paper 320, portrait crop with the burnt foot, lightened to a 0.36 luminance floor (`tools/textures/gentex7.py`) | Texturelabs licence, as above |
| `tack.webp` | the tack pinning the docket and the toast | Texturelabs Details 141, cut out | Texturelabs licence, as above |
| `stamp-wear.webp` | wear mask on the NOT PAID / PAID stamps (90 % ink or more), the toast icon and its red error ribbon | Texturelabs InkPaint 128, greyscale to alpha | Texturelabs licence, as above |
| `torn-edge.webp` | torn right edge of paid order bars (mask) | drawn in `gentex7.py` | ours |
| `note.webp` | toast note, all pages (`border-image`, 9-slice so the burnt rim keeps its size) | Texturelabs Paper 329, inner area lightened to a 0.36 luminance floor (`tools/textures/gentex8.py`) | Texturelabs licence, as above |
| `strike.svg` | brush strike over an order row while its remove cross is hovered or focused (mask) | drawn in `tools/textures/brush.py` | ours |
| `mist.webp` | sea mist under an open toast | Texturelabs Atmosphere 142, greyscale to white alpha, faded to a soft bank | Texturelabs licence, as above |
| `coin.webp` | gold cob coin on the customer credit label | Texturelabs Details 141 (the metal disc), toned to gold, uneven cob edge and a worn cross struck in (`tools/textures/gentex9.py`) | Texturelabs licence, as above |
| `rope.webp` | hemp cord of the flag line, app footers | [photo cEWREu21dmU](https://unsplash.com/photos/cEWREu21dmU) by Thomas Kinto on Unsplash, a strip keyed off its black ground, shrunk to cord thickness, tiled and bent into the sag (`gentex9.py`) | [Unsplash licence](https://unsplash.com/license): free use and changes, no resale as stock |
| `nail.webp` | rusty nail heads holding the cord, app footers | [photo U_Ytvt1eTfM](https://unsplash.com/photos/U_Ytvt1eTfM) by Ian Talmacs on Unsplash, one head cut out and domed with a light from the top left (`gentex9.py`) | Unsplash licence, as above |
| `flag-eng/sve/ita/esp/pirate.webp` | cloth flags of the flag line, app footers | our flag files above, woven with Texturelabs Paper 214, folded, faded, stained with Wood 131 and torn at the fly (`tools/textures/gentex10.py`) | flag designs public domain; textures Texturelabs licence |
| `board-surface.webp`, `board-kelp.webp` | active tab board | [Poly Haven](https://polyhaven.com/a/green_rough_planks) Green Rough Planks by Rob Tuytel, toned to Sea Glass and Weathered Copper | CC0 |

The label areas of the paper files were lightened where needed so sepia text keeps 5:1 on their darkest pixel; `tests/textures.spec.js` checks this on the files.

The drink photos were converted in V10 from PNG (up to 4002 px tall, 48.5 MB) to WebP, 400 px tall at most, quality 82 (2.5 MB). The original PNGs remain in git history before that change.

The flags were cut in V11 from 1200x750 PNG/JPEG (260 KB) to 128x80 WebP, twice their 64x40 display size (7.3 KB). The originals remain in git history.

## Hot-linked media

| What | Where | Source | Licence |
|---|---|---|---|
| Easter egg video and poster | was `index.html` `#great` | hot-linked from `img-9gag-fun.9cache.com` | removed in V9, replaced by `logo/ghost-ship.webp` (public domain) |

## Fonts and libraries (loaded from CDNs)

| What | Source | Licence |
|---|---|---|
| Oswald (variable, 400 to 700) | Google Fonts | SIL Open Font License 1.1 |
| Berkshire Swash | Google Fonts | SIL Open Font License 1.1 |
| jQuery 3.2.1 | ajax.googleapis.com | MIT |
| axe-core 4.10.2 (tests only) | cdnjs | MPL 2.0 |
