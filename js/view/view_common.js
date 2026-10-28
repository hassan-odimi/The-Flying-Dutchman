/** The Flying Dutchman
 *  view_common.js
 *  Created by 'Pirates of the Caribbean' on 21 of February 2018.
 */

/* ALL COMMON PAGE TEXTS
*  The indexes and their corresponding languages: [0] English , [1] Swedish, [2] Italian, [3] Spanish, [4] Pirate
*  1. First create an array, follow this template:
*
*  var redundant_name = ["ENGLISH",
*                        "SWEDISH",
*                        "ITALIAN",
*                        "SPANISH",
*                        "PIRATE"]
*
*  Do not skip any indexes! Follow indentation!
*  2. Locate HTML object on the corresponding HTML file -> add id="unique_id"
*  3. Then update translate() method on the corresponding js script page!
*/

var page_title = ["The Flying Dutchman",
                    "Flygande Holländaren",
                    "L'Olandese Volante",
                    "El Holandés Volador",
                    "Th' Flyin' Dutchman"];

var logout = ["Log Out",
            "Logga Ut",
            "Esci",
            "Cerrar Sesión",
            "Scutter"];

var login_as = ["Log in as:",
                "Logga in som:",
                "Accesso come:",
                "Sesión de:",
                "The King:"];

// Accessible name of the scrollable drink list (customer and management)
var drinks_region = ["Drinks",
                     "Drycker",
                     "Bevande",
                     "Bebidas",
                     "Th' Grog"];

// Undo/redo button labels (visible on wide screens, screen-reader only on small ones)
var undo_label = ["Undo",
                  "Ångra",
                  "Annulla",
                  "Deshacer",
                  "Belay that"];

var redo_label = ["Redo",
                  "Gör om",
                  "Ripeti",
                  "Rehacer",
                  "Once more"];

// First half of each remove button's name, e.g. "Remove Heineken"
var remove_word = ["Remove",
                   "Ta bort",
                   "Rimuovi",
                   "Quitar",
                   "Toss overboard"];

// Feedback messages (toast + screen-reader announcements)
var msg_wrong_username = ["Wrong user name. Try again.",
                          "Fel användarnamn. Försök igen.",
                          "Nome utente errato. Riprova.",
                          "Nombre de usuario incorrecto. Inténtalo de nuevo.",
                          "No such sailor aboard. Try again."];

var msg_wrong_password = ["Wrong password. Try again.",
                          "Fel lösenord. Försök igen.",
                          "Password errata. Riprova.",
                          "Contraseña incorrecta. Inténtalo de nuevo.",
                          "That be the wrong password. Try again."];

var msg_access_denied = ["Access denied. You were sent to your own page.",
                         "Åtkomst nekad. Du skickades till din egen sida.",
                         "Accesso negato. Sei stato portato alla tua pagina.",
                         "Acceso denegado. Te llevamos a tu propia página.",
                         "No entry, matey! Back to yer own deck."];

// "Heineken added. Total: SEK 100:-"
var msg_added = ["added",
                 "tillagd",
                 "aggiunto",
                 "añadido",
                 "hauled aboard"];

var msg_removed = ["removed",
                   "borttagen",
                   "rimosso",
                   "quitado",
                   "tossed overboard"];
