/** The Flying Dutchman
 *  view_index.js
 *  Created by Pirates of the Caribbean on 21 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
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

/* About window (F10): the lede, three headings, two lists (one array per language, five lines each) and the source label. The crew names are not translated. */
var about_lede = ["A bar ordering system, built in 2018 for User Interface Programming I at Uppsala University. Plain HTML, CSS and jQuery, no framework.",
                  "Ett beställningssystem för en bar, byggt 2018 i kursen User Interface Programming I vid Uppsala universitet. Ren HTML, CSS och jQuery, inget ramverk.",
                  "Un sistema di ordinazione per un bar, creato nel 2018 per il corso User Interface Programming I all'Università di Uppsala. Solo HTML, CSS e jQuery, nessun framework.",
                  "Un sistema de pedidos para un bar, creado en 2018 para el curso User Interface Programming I de la Universidad de Uppsala. HTML, CSS y jQuery, sin frameworks.",
                  "A tavern orderin' system, built in 2018 fer User Interface Programming I at Uppsala University. Plain HTML, CSS 'n jQuery, no framework, arr."];

var about_try_title = ["Try it",
                       "Testa",
                       "Provalo",
                       "Pruébalo",
                       "Try it, matey"];

var about_try = [["Open Get the passwords and pick a role.", "Order as a customer, serve as a bartender, restock as a manager.", "Every action can be undone.", "Change language with the flags.", "Drop the pirate flag on the ship."],
                 ["Öppna Get the passwords och välj en roll.", "Beställ som kund, servera som bartender, fyll på som chef.", "Alla åtgärder kan ångras.", "Byt språk med flaggorna.", "Släpp piratflaggan på skeppet."],
                 ["Apri Get the passwords e scegli un ruolo.", "Ordina come cliente, servi come barista, rifornisci come gestore.", "Ogni azione può essere annullata.", "Cambia lingua con le bandiere.", "Trascina la bandiera pirata sulla nave."],
                 ["Abre Get the passwords y elige un rol.", "Pide como cliente, sirve como camarero, repón como gerente.", "Cualquier acción se puede deshacer.", "Cambia el idioma con las banderas.", "Suelta la bandera pirata sobre el barco."],
                 ["Open Get the passwords 'n pick yer role.", "Order as a customer, serve as a bartender, restock as th' manager.", "Every deed can be undone.", "Change tongue with th' flags.", "Drop th' pirate flag on th' ship."]];

var about_built_title = ["Built with",
                         "Byggd med",
                         "Realizzato con",
                         "Hecho con",
                         "Built with"];

var about_built = [["HTML, CSS, jQuery", "Undo and redo", "Drag and drop", "5 languages", "Works on phones"],
                   ["HTML, CSS, jQuery", "Ångra och gör om", "Dra och släpp", "5 språk", "Fungerar på mobiler"],
                   ["HTML, CSS, jQuery", "Annulla e ripeti", "Trascina e rilascia", "5 lingue", "Funziona sui telefoni"],
                   ["HTML, CSS, jQuery", "Deshacer y rehacer", "Arrastrar y soltar", "5 idiomas", "Funciona en móviles"],
                   ["HTML, CSS, jQuery", "Undo 'n redo", "Drag 'n drop", "5 tongues", "Works on phones, matey"]];

var about_crew_title = ["Crew",
                        "Besättning",
                        "Equipaggio",
                        "Tripulación",
                        "Th' crew"];

var about_source = ["Source code:",
                    "Källkod:",
                    "Codice sorgente:",
                    "Código fuente:",
                    "Th' source code:"];
