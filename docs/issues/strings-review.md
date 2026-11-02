# New strings since V9, for wording review (SV / IT / ES / Pirate)

Generated from `js/view/view_*.js` (arrays added after commit 8316b0a). Edit a line here or tell me the change.
Open points:
- Pirate keeps plain English in many places (tab labels, receipt, "Total"). Say which ones should get a pirate voice.
- `view_customer.js` `total_label` Pirate is "Wadarta:" (Somali for "Total", from 2018, not new). Suggest "Total:" or "Tally:".
- `order_word` Pirate is "Debt" ("Debt #20" on cards and toasts). Keep?

## js/view/view_common.js
- title_login_failed: EN="Login failed" | SV="Inloggningen misslyckades" | IT="Accesso non riuscito" | ES="Error de inicio de sesión" | Pirate="Boardin' failed"
- title_access_denied: EN="Access denied" | SV="Åtkomst nekad" | IT="Accesso negato" | ES="Acceso denegado" | Pirate="No entry, matey!"
- sound_label: EN="Sound" | SV="Ljud" | IT="Suono" | ES="Sonido" | Pirate="Shanty" (V12)
- sound_wait: EN="Sound starts after your first click." | SV="Ljudet startar efter ditt första klick." | IT="Il suono parte dopo il tuo primo clic." | ES="El sonido empieza después de tu primer clic." | Pirate="Sound starts after yer first click." (V12; shown in S8)
## js/view/view_index.js
- about_lede: EN="A bar ordering system, built in 2018 for User Interface Programming I at Uppsala University. Plain HTML, CSS and jQuery, no framework." | SV="Ett beställningssystem för en bar, byggt 2018 i kursen User Interface Programming I vid Uppsala universitet. Ren HTML, CSS och jQuery, inget ramverk." | IT="Un sistema di ordinazione per un bar, creato nel 2018 per il corso User Interface Programming I all'Università di Uppsala. Solo HTML, CSS e jQuery, nessun framework." | ES="Un sistema de pedidos para un bar, creado en 2018 para el curso User Interface Programming I de la Universidad de Uppsala. HTML, CSS y jQuery, sin frameworks." | Pirate="A tavern orderin' system, built in 2018 fer User Interface Programming I at Uppsala University. Plain HTML, CSS 'n jQuery, no framework, arr."
- about_try_title: EN="Try it" | SV="Testa" | IT="Provalo" | ES="Pruébalo" | Pirate="Try it, matey"
- about_built_title: EN="Built with" | SV="Byggd med" | IT="Realizzato con" | ES="Hecho con" | Pirate="Built with"
- about_crew_title: EN="Crew" | SV="Besättning" | IT="Equipaggio" | ES="Tripulación" | Pirate="Th' crew"
- about_source: EN="Source code:" | SV="Källkod:" | IT="Codice sorgente:" | ES="Código fuente:" | Pirate="Th' source code:"
## js/view/view_customer.js
- title_empty_order: EN="Nothing to order" | SV="Inget att beställa" | IT="Niente da ordinare" | ES="Nada que pedir" | Pirate="Naught t' order"
- title_payed_order: EN="Order paid" | SV="Beställning betald" | IT="Ordine pagato" | ES="Pedido pagado" | Pirate="Order be paid"
- title_placed_order: EN="Order placed" | SV="Beställning skickad" | IT="Ordine inoltrato" | ES="Pedido realizado" | Pirate="Order be placed"
## js/view/view_management.js
- title_empty_order: EN="Nothing to order" | SV="Inget att beställa" | IT="Niente da ordinare" | ES="Nada que pedir" | Pirate="Naught t' order"
- title_placed_order: EN="Order placed" | SV="Beställning skickad" | IT="Ordine inoltrato" | ES="Pedido realizado" | Pirate="Order be placed"
- your_order: EN="Your Order" | SV="Din beställning" | IT="Il tuo ordine" | ES="Su pedido" | Pirate="Th' Booty"
- total_label: EN="Total:" | SV="Totalt:" | IT="Totale:" | ES="Total:" | Pirate="Total:"
- receipt_title: EN="Stock order" | SV="Lagerorder" | IT="Ordine di scorta" | ES="Pedido de existencias" | Pirate="Stock order"
- receipt_total: EN="Total" | SV="Totalt" | IT="Totale" | ES="Total" | Pirate="Total"
- receipt_stamp: EN="Ordered" | SV="Beställd" | IT="Ordinato" | ES="Pedido hecho" | Pirate="Ordered"
- receipt_note: EN="Delivery is booked with each supplier." | SV="Leverans bokas hos varje leverantör." | IT="La consegna viene prenotata con ogni fornitore." | ES="La entrega se reserva con cada proveedor." | Pirate="Delivery be booked with each supplier."
- receipt_new: EN="Start a new order" | SV="Starta en ny order" | IT="Inizia un nuovo ordine" | ES="Empezar un nuevo pedido" | Pirate="Start a new order"
- receipt_locale: EN="en-GB" | SV="sv-SE" | IT="it-IT" | ES="es-ES" | Pirate="en-GB"
## js/view/view_bartender.js
- paid_credit: EN="with credit" | SV="med kredit" | IT="con credito" | ES="con crédito" | Pirate="with yer credit"
- title_mark_paid: EN="Marked as paid" | SV="Markerad som betald" | IT="Segnato come pagato" | ES="Marcado como pagado" | Pirate="Debt be settled"
- title_delete_order: EN="Order removed" | SV="Beställning borttagen" | IT="Ordine rimosso" | ES="Pedido eliminado" | Pirate="Order be forgotten"
- order_word: EN="Order" | SV="Beställning" | IT="Ordine" | ES="Orden" | Pirate="Debt"
- tab_all: EN="All Orders" | SV="Alla beställningar" | IT="Tutti gli ordini" | ES="Todos los pedidos" | Pirate="All Orders"
- tab_unpaid: EN="Unpaid Orders" | SV="Obetalda beställningar" | IT="Ordini non pagati" | ES="Pedidos sin pagar" | Pirate="Unpaid Orders"
- tab_paid: EN="Paid Orders" | SV="Betalda beställningar" | IT="Ordini pagati" | ES="Pedidos pagados" | Pirate="Paid Orders"
- tab_update: EN="Update Orders" | SV="Uppdatera beställningar" | IT="Aggiorna ordini" | ES="Actualizar pedidos" | Pirate="Update Orders"
- pile_waiting: EN="Waiting" | SV="Väntar" | IT="In attesa" | ES="En espera" | Pirate="Waitin'"
- pile_paid: EN="Paid" | SV="Betalda" | IT="Pagati" | ES="Pagados" | Pirate="Settled"
- state_unpaid: EN="Not paid" | SV="Obetald" | IT="Non pagato" | ES="No pagado" | Pirate="Owed"
- state_paid: EN="Paid" | SV="Betald" | IT="Pagato" | ES="Pagado" | Pirate="Settled"
- paid_by: EN="by" | SV="av" | IT="da" | ES="por" | Pirate="by"
- total_word: EN="Total" | SV="Totalt" | IT="Totale" | ES="Total" | Pirate="Total"
- kronor_word: EN="kronor" | SV="kronor" | IT="corone" | ES="coronas" | Pirate="kronor"
- new_orders_label: EN=" (new orders)" | SV=" (nya beställningar)" | IT=" (nuovi ordini)" | ES=" (pedidos nuevos)" | Pirate=" (fresh orders, matey)"
