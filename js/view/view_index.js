/** The Flying Dutchman
 *  view_index.js
 *  Created by Pirates of the Caribbean on 21 of February 2018.
 */

/* INDEX PAGE TEXTS
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

var welcome = ["Welcome to The Flying Dutchman!",
               "Välkommen till Flygande Holländaren!",
               "Benvenuti al'Olandese Volante!",
               "Bienvenidos al Holandés Volador!",
               "Ahoy t' Th' Flyin' Dutchman!"];

var customer = ["Order your Drinks!",
                "Logga in som gäst",
                "Accesso avventore",
                "Acceso cliente",
                "Order yer Drinks"];

var bartender = ["Bartender login",
                 "Logga in som bartender",
                 "Accesso barista",
                 "Acceso barista",
                 "Bartender login"];

var management = ["Management login",
                  "Logga in som arbetledare",
                  "Accesso gestione",
                  "Acceso administración",
                  "Management login"];

var user_name = ["User name",
                 "Användarnamn",
                 "Nome utente",
                 "Nombre de usuario",
                 "User name"];

var password = ["Password",
                "Lösenord",
                "Parola d'ordine",
                "Contraseña",
                "Password"];

var login = ["Login",
             "Logga in",
             "Accesso",
             "Iniciar sesión",
             "Login"];


var close_label = ["Close",
                   "Stäng",
                   "Chiudi",
                   "Cerrar",
                   "Batten down"];

var logo_alt = ["The Flying Dutchman",
                "Flygande Holländaren",
                "L'Olandese Volante",
                "El Holandés Volador",
                "Th' Flyin' Dutchman"];

// V9: the logo button's action, read after logo_alt
var summon_action = ["summon the ghost ship",
                     "kalla fram spökskeppet",
                     "evoca la nave fantasma",
                     "invoca el barco fantasma",
                     "raise th' ghost ship"];

// V8: demo-logins panel in the Passwords window
var passwords_title = ["Login Passwords",
                       "Inloggningsuppgifter",
                       "Credenziali di accesso",
                       "Credenciales de acceso",
                       "Th' Secret Words"];

var demo_intro = ["Demo accounts. Use fills the login form for you.",
                  "Demokonton. Använd fyller i inloggningen åt dig.",
                  "Account demo. Usa compila il modulo di accesso per te.",
                  "Cuentas de demostración. Usar rellena el formulario por ti.",
                  "Demo accounts. Use 'er fills in th' login fer ye."];

var use_label = ["Use",
                 "Använd",
                 "Usa",
                 "Usar",
                 "Use 'er"];

var group_vip = ["VIP customers",
                 "VIP-gäster",
                 "Clienti VIP",
                 "Clientes VIP",
                 "VIP buccaneers"];

var group_regular = ["Customer, no credit",
                     "Gäst utan kredit",
                     "Cliente senza credito",
                     "Cliente sin crédito",
                     "Landlubber, no doubloons"];

var group_bartenders = ["Bartenders",
                        "Bartendrar",
                        "Baristi",
                        "Camareros",
                        "Grog pourers"];

var group_manager = ["Manager",
                     "Arbetsledare",
                     "Gestore",
                     "Gerente",
                     "Cap'n"];

var group_test = ["Test users, every page",
                  "Testanvändare, alla sidor",
                  "Utenti di prova, tutte le pagine",
                  "Usuarios de prueba, todas las páginas",
                  "Test swabs, every deck"];

var role_customer = ["Customer",
                     "Gäst",
                     "Cliente",
                     "Cliente",
                     "Buccaneer"];

var role_bartender = ["Bartender",
                      "Bartender",
                      "Barista",
                      "Camarero",
                      "Grog pourer"];

var role_manager = group_manager; // one manager, same word
