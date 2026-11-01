/** The Flying Dutchman
 *  view_customer.js
 *  Created by 'Pirates of the Caribbean' on 21 of February 2018.
 *  Updated on 23 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
 */

/* CUSTOMER PAGE TEXTS
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

var title = ["The Flying Dutchman's List of Drinks",
            "Flygande Holländaren drycklista",
            "Lista di bevande nell'Olandese Volante",
            "Lista de tragos del Holandés Volador",
            "Th' Flyin' Dutchman't Loot"];

// User info panel (top right corner)
var customer= ["Customer:",
                "Kund:",
                "Cliente:",
                "Cliente:",
                "Pirate:"
                ];

var credit= ["Credit",
            "Kredit",
            "Credito",
            "Crédito",
            "Yu'r Loot"
];

// The drink list panel
var drink_list= ["Our Drink List",
                "Vår drycklista",
                "Nostra lista de bevande",
                "Nuestra lista de bebidas",
                "Booty Chest"
];
// start drinks taps
var all= ["All",
        "Allt",
        "Tutte",
        "Todas",
        "Argh!"
];

var beers= ["Beers",
            "Öl",
            "Birre",
            "Cervezas",
            "Them Beers"
];

var wines= ["Wines",
            "Vin",
            "Vini",
            "Vinos",
            "Ol' Wines"
];

var spirits= ["Spirits",
            "Sprit",
            "Distillate",
            "Destiladas",
            "Rons!"
];

var kosher= ["Kosher",
            "Koscher",
            "Kosher",
            "Kosher",
            "K'sher"
];

var ecologic= ["Ecologic",
                "Ekologisk",
                "Ecologico",
                "Ecológico",
                "Tree Hugga'"
];

var specials= ["Specials",
                "Särskild",
                "Speciali",
                "Especiales",
                "King' Onlies"
];
//end of drinks taps

var your_order= ["Your Order",
                "Din beställning",
                "Il tuo ordine",
                "Su pedido",
                "Th' Booty"
];

// Shown in the order panel while it is empty
var empty_order= ["Nothing ordered yet. Choose a drink to add it.",
                "Inget beställt än. Välj en dryck för att lägga till den.",
                "Nessun ordine ancora. Scegli una bevanda da aggiungere.",
                "Aún no has pedido nada. Elige una bebida para añadirla.",
                "Yer tankard be empty! Pick a grog to fill 'er up."
];

var total_label= ["Total:",
            "Totalt:",
            "Totale:",
            "Total:",
            "Wadarta:"
];

var pl_order= ["Place Order",
                "Beställ",
                "Invia ordine",
                "Realizar pedido",
                "Board 'em!"
];

var hello = ["Hello ",
             "Hejsan ",
             "Ciao ",
             "Hola ",
             "Ahoy "];

var your_credit = ["Credit",
                   "Kredit",
                   "Credito",
                   "Crédito",
                   "Doubloons" ];

// Toast messages: a short title and one detail line (read together by the screen reader)
var title_empty_order = ["Nothing to order",
                         "Inget att beställa",
                         "Niente da ordinare",
                         "Nada que pedir",
                         "Naught t' order"];
var message_empty_order = ["Select your drinks before placing an order.",
                           "Välj dina drycker innan du beställer.",
                           "Seleziona le bevande prima di ordinare.",
                           "Seleccione sus bebidas antes de hacer el pedido.",
                           "Pick yer drinks afore placin' an order."];

var title_payed_order = ["Order paid",
                         "Beställning betald",
                         "Ordine pagato",
                         "Pedido pagado",
                         "Order be paid"];
var message_payed_order = ["Paid from your credit. Pick up your drinks in the VIP fridge.",
                           "Betald med din kredit. Hämta dina drycker i VIP-kylen.",
                           "Pagato con il tuo credito. Ritira le bevande nel frigo VIP.",
                           "Pagado con su crédito. Recoja sus bebidas en el refrigerador VIP.",
                           "Paid from yer credit. Pick up yer drinks in th' VIP fridge."];

var title_placed_order = ["Order placed",
                          "Beställning skickad",
                          "Ordine inoltrato",
                          "Pedido realizado",
                          "Order be placed"];
var message_placed_order = ["Go to the counter and pay before you pick up your drinks.",
                            "Betala vid disken innan du hämtar dina drycker.",
                            "Vai al banco e paga prima di ritirare i drink.",
                            "Dirígete al mostrador y paga antes de recoger tus bebidas.",
                            "Head t' th' counter 'n pay afore ye pick up yer drinks."];


// Accessible name of the small-screen category menu button
var drink_categories = ["Drink categories",
                        "Dryckeskategorier",
                        "Categorie di bevande",
                        "Categorías de bebidas",
                        "Kinds o' Grog"];

// Stock badges on the drink cards
var low_stock = ["Low stock",
                 "Få kvar",
                 "Scorte basse",
                 "Pocas existencias",
                 "Runnin' dry!"];

var out_stock = ["Out of stock",
                 "Slut i lager",
                 "Esaurito",
                 "Agotado",
                 "Bone dry!"];
