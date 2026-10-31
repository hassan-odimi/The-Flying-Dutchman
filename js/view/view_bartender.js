/** The Flying Dutchman
 *  view_bartender.js
 *  Created by 'Pirates of the Caribbean' on 21 of February 2018.
 *  Updated on 23 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
 */

/* BARTENDER PAGE TEXTS
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

var title = ["Bartender View",
            "Bartendersidan",
            "Vista Barista",
            "Vista de barman",
            "Bartender View"];

var orders_q= ["Orders Queue",
                "Beställningar kö",
                "Coda ordini",
                "Pedidos en cola",
                "Orders Queue"];

var cancel_order= ["Cancel Order",
                    "Avbryt beställning",
                    "Annulla Ordine",
                    "Cancelar orden",
                    "Cancel Order"];

var mark_paid= ["Mark as Paid",
                "Markera som betald",
                "Contrassegna come pagato",
                "Marcar como pagado",
                "Mark as Paid"];

var paid_credit= ["with credit",
                  "med kredit",
                  "con credito",
                  "con crédito",
                  "with yer credit"];


// Toast messages: a short title and one detail line (read together by the screen reader)
var title_mark_paid = ["Marked as paid",
                       "Markerad som betald",
                       "Segnato come pagato",
                       "Marcado como pagado",
                       "Debt be settled"];
var title_delete_order = ["Order removed",
                          "Beställning borttagen",
                          "Ordine rimosso",
                          "Pedido eliminado",
                          "Order be forgotten"];

var order_word = ["Order", "Beställning", "Ordine", "Orden", "Debt"];

function message_order_ref (order_id, index) {
    return order_word[index] + " #" + order_id.slice(1);
}

// Order cards (F11): pile headings, stamps, and the words only a screen reader hears
var pile_waiting = ["Waiting", "Väntar", "In attesa", "En espera", "Waitin'"];
var pile_paid = ["Paid", "Betalda", "Pagati", "Pagados", "Settled"];
var state_unpaid = ["Not paid", "Obetald", "Non pagato", "No pagado", "Owed"];
var state_paid = ["Paid", "Betald", "Pagato", "Pagado", "Settled"];
var paid_by = ["by", "av", "da", "por", "by"];
var total_word = ["Total", "Totalt", "Totale", "Total", "Total"];
var kronor_word = ["kronor", "kronor", "corone", "coronas", "kronor"];

var new_orders_label= [" (new orders)",
                       " (nya beställningar)",
                       " (nuovi ordini)",
                       " (pedidos nuevos)",
                       " (fresh orders, matey)"];
