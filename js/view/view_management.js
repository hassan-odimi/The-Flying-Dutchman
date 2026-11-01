/** The Flying Dutchman
 *  view_management.js
 *  Created by 'Pirates of the Caribbean' on 21 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
 */

/* MANAGEMENT PAGE TEXTS
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

var title = ["Drink Delivery Database System",
             "Databas för Drikesleverance",
             "Sistema di database per consegne",
             "Sistema de base de datos para entregas",
             "Drink Delivery Database System"];

var stock_order = ["Stock Order",
                   "Lagerbeställning",
                   "Ordine di riserva",
                   "Orden de Stock",
                    "Stock Order"];

 var drinks_list = ["Full Drinks List",
                    "Full drinklista",
                    "Lista completa",
                    "Lista completa",
                    "Full Drinks List"];
    
var check_stock = ["Check Bar Stock",
                "Kontrollera Bar Lager",
                "Magazzino",
                "En Almacén",
                "Check Bar Stock"];

var shortage_alert = ["Shortage Alert (!)",
                    "Bristvarning (!)",
                    "Avviso di carenza (!)",
                    "Alerta de escasez (!)",
                    "Shortage Alert (!)"];

// The drink's details.
var drink_name = ["Name:",
                "Namn:",
                "Nome:",
                "Nombre:",
                "Name:"];

var type = ["Type:",
            "Typ:",
            "Tipo:",
            "El tipo:",
            "Type:"];

var price= ["Price:",
            "Pris:",
            "Prezzo:",
            "Precio:",
            "Price:"];

var country= ["Country:",
            "Land:",
            "Nazione:",
            "País:",
            "Country:"];

var volume= ["Volume:",
            "Volym:",
            "Volume:",
            "Volumen:",
            "Volume:"];

var alcohol=["Alcohol:",
            "Alkohol:",
            "Alcol:",
            "Alcohol:",
            "Alcohol:"];

var drink_id=["ID:",
            "ID:",
            "ID:",
            "ID:",
            "ID:"];

var producer=["Producer:",
            "Producent:",
            "Produttore:",
            "Productor:",
            "Producer:"];

var delivery=["Delivery:",
            "Leverans:",
            "La Consegna:",
            "La Entrega:",
            "Delivery:"];

var cost=["Cost per Liter:",
        "Kostnad per liter:",
        "Costo per litro:",
        "Costo por litro:",
        "Cost per Liter:"];

var inStock=["In Stock:",
            "I lager:",
            "Disponibile:",
            "En stock:",
            "In Stock:"];

var not_stocked=["Not stocked",
                "Ej i lager",
                "Non disponibile",
                "Sin stock",
                "Not in the hold"];

var catalogue_only=["Catalogue only",
                "Endast katalog",
                "Solo catalogo",
                "Solo catálogo",
                "Chart only"];

var add_one=["Add +1",
            "Tillägga +1",
            "Aggiungere +1",
            "Agregar +1",
            "Add +1"];

var add_ten=["Add +10",
            "Tillägga +10",
            "Aggiungere +10",
            "Agregar +10",
            "Add +10"];

var add_hundred=["Add +100",
                "Tillägga +100",
                "Aggiungere +100",
                "Agregar +100",
                "Add +100"];

var total= ["TOTAL:",
            "TOTAL:",
            "TOTALE:",
            "TOTAL:",
            "TOTAL:"];

var pay= ["Place Stock Order",
        "Placera lagerorder",
        "Posizionare l'ordine",
        "Realizar pedido",
        "Place Stock Order"];

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

var title_placed_order = ["Order placed",
                          "Beställning skickad",
                          "Ordine inoltrato",
                          "Pedido realizado",
                          "Order be placed"];

// Order panel header and total (the total reads "Total: SEK 154:-")
var your_order = ["Your Order", "Din beställning", "Il tuo ordine", "Su pedido", "Th' Booty"];
var total_label = ["Total:", "Totalt:", "Totale:", "Total:", "Total:"];

// Order receipt (F13)
var receipt_title = ["Stock order", "Lagerorder", "Ordine di scorta", "Pedido de existencias", "Stock order"];
var receipt_total = ["Total", "Totalt", "Totale", "Total", "Total"];
var receipt_stamp = ["Ordered", "Beställd", "Ordinato", "Pedido hecho", "Ordered"];
var receipt_note = ["Delivery is booked with each supplier.",
                    "Leverans bokas hos varje leverantör.",
                    "La consegna viene prenotata con ogni fornitore.",
                    "La entrega se reserva con cada proveedor.",
                    "Delivery be booked with each supplier."];
var receipt_new = ["Start a new order", "Starta en ny order", "Inizia un nuovo ordine", "Empezar un nuevo pedido", "Start a new order"];
var receipt_locale = ["en-GB", "sv-SE", "it-IT", "es-ES", "en-GB"];

// the line read out with the toast: "Stock order 0042, total SEK 495."
function message_receipt (no, total, index) {
    return receipt_title[index] + " " + no + ", " + receipt_total[index].toLowerCase() + " SEK " + total + ".";
}
