/** The Flying Dutchman
 *  view_common.js
 *  Created by 'Pirates of the Caribbean' on 21 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
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

// Sound plate (V12): the label, and the note that browsers keep a page silent until the first click
var sound_label = ["Sound",
                   "Ljud",
                   "Suono",
                   "Sonido",
                   "Shanty"];

var sound_wait = ["Sound starts after your first click.",
                  "Ljudet startar efter ditt första klick.",
                  "Il suono parte dopo il tuo primo clic.",
                  "El sonido empieza después de tu primer clic.",
                  "Sound starts after yer first click."];

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
var title_login_failed = ["Login failed",
                          "Inloggningen misslyckades",
                          "Accesso non riuscito",
                          "Error de inicio de sesión",
                          "Boardin' failed"];

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

var title_access_denied = ["Access denied",
                           "Åtkomst nekad",
                           "Accesso negato",
                           "Acceso denegado",
                           "No entry, matey!"];
var msg_access_denied = ["You were sent to your own page.",
                         "Du skickades till din egen sida.",
                         "Sei stato portato alla tua pagina.",
                         "Te llevamos a tu propia página.",
                         "Back to yer own deck."];

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
