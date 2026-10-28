# Orca Pass Checklist

Keep this open beside Firefox. Write each problem in `docs/orca-findings.md`.

## Setup
- [ ] Turn on Orca: **Super+Alt+S** (press again to turn it off)
- [ ] Orca key: **Insert** (desktop layout) or **Caps Lock** (laptop layout). Settings: **Orca+Space**
- [ ] Open Firefox at `http://localhost:8080`, then press **Ctrl+Shift+R**
- [ ] Login for all views: `test` / `test`

## Keys
| Key | Does |
|---|---|
| Tab / Shift+Tab | Next or previous control |
| Enter / Space | Activate |
| H | Next heading |
| B | Next button |
| F | Next form field |
| Orca+A | Browse or focus mode |
| Ctrl | Stop speech |
| Orca+; (laptop) or Orca+Numpad Plus | Read all from here |

## Index
- [ ] Logo is read as a name, not a file name
- [ ] "Get the passwords" opens, the text is readable, and Close works
- [ ] "About this project" opens and closes the same way
- [ ] "Order your Drinks!" opens the login box
- [ ] Fields are read as "User name" and "Password", each with its label
- [ ] Wrong password: the error is read once, and the field is read as "invalid"
- [ ] Svenska flag: the voice switches to Swedish
- [ ] Each flag is read in its own language, and the current one says "current"

## Customer
- [ ] H finds one heading: "Hello [name]!" with the credit line after it
- [ ] Category tabs: "toggle button, pressed" on the selected tab and "not pressed" on the others
- [ ] The drink list is read as a region
- [ ] Each drink button says the drink name
- [ ] Add a drink: "[drink] added. Total: SEK …", read once
- [ ] Remove a drink: the button says "Remove [drink]", and the new total is read
- [ ] Undo and Redo: read as "unavailable" or "dimmed" when there is nothing to undo or redo
- [ ] Undo and Redo each announce their change
- [ ] Place Order: the confirmation is read
- [ ] Log Out works

## Bartender (Bartender login, `test` / `test`)
- [ ] Each order row is read as "button, collapsed", and Enter makes it "expanded"
- [ ] The items inside an open order are readable
- [ ] Mark as Paid: the result is read
- [ ] Cancel Order: the result is read
- [ ] Tabs are read the same way as in the customer view

## Management (Management login, `test` / `test`)
- [ ] Tabs are read the same way as in the customer view
- [ ] Add +1, +10 and +100 each say which drink they are for
- [ ] Each press announces the change
- [ ] Out-of-stock drinks are read as "unavailable"
- [ ] Place Stock Order: the confirmation is read, and focus stays on the button

## Everywhere
- [ ] Nothing is read twice (the toast and the announcement)
- [ ] Focus never jumps to the top of the page by itself
- [ ] Switch to Pirate: the announcements are in Pirate

## Mouse drag (Orca off is fine)
- [ ] Drag the pirate flag onto the ship: the video replaces the logo
- [ ] Drag the flag again: the logo comes back
