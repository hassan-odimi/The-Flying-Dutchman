/** The Flying Dutchman
 *  bartender.js
 *  Created by 'Pirates of the Caribbean' on 11 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
*/

/*BARTENDER PAGE SCRIPTS
* All scripts related to the bartender page. Each page has their own scripts in a single js document.
* Method translate() is unique for each individual page and can be found at the bottom of each script.
*/

var current_bartender = localStorage.getItem('id');
var current_tab = "all";

/*UNDO-REDO ARRAYS*/
var done = new Array(); // keeps track of 'done' actions
var undone = new Array();                    // keeps track of 'redone' actions

$(document).ready(function() {
    rePrintTab(); // print all orders from the database
    highlightTab("*#all"); // highlight the 'all'-tab

    pushStateTo(done);  // push initial state to 'done' stack
    $("#redo").addClass("fade");
    $("#undo").addClass("fade");
    
    // check if a new order has been submitted
    t1 = window.setInterval(function() {checkOnOrders()}, 2000);
    function checkOnOrders() {
        if (localStorage.getItem("NEWORDER") == 1) {
            $("#retrieve_orders").addClass("has-new");
            localStorage.setItem("NEWORDER", 0);
        }          
    }

    // display new orders on click 
    $("#retrieve_orders").click(function() {
        if ($(this).hasClass("has-new")) {
            $("#retrieve_orders").removeClass("has-new");
            updateTransactions();
            clearUndone();
            clearDone();      }
    });
    
    // filter orders by category
    $.each(["all", "unpaid", "paid"], function(i, tab) {
        $("#" + tab).click(function() {
            highlightTab("*#" + tab);
            current_tab = tab;
            rePrintTab();
        });
    });

    /* Card script (F11): one card open on the whole table, a click on empty table or Esc closes it (Esc gives focus back to the card) */
    $(document).on('click','.accordion',function(){
        var open = !this.classList.contains("active");
        $('.accordion.active').each(function() { setOpen(this, false); });
        setOpen(this, open);
    });

    $('#all_orders').on('click', function(e) {
        if (!$(e.target).closest('.pc').length) $('.accordion.active').each(function() { setOpen(this, false); });
    });

    $(document).on('keydown', function(e) {
        if (e.key != "Escape") return;
        var card = $(".accordion.active").filter(function() { return this.parentNode.contains(document.activeElement); })[0];
        if (card) { setOpen(card, false); card.focus(); }
    });

    $(document).on('click','.delete',function() {
        var find_transaction_id = $(this).attr('id');
        //alert("Ready to delete " + find_transaction_id);
        //alert(SESSIONS_TRANSACTIONS.toSource());

        for (i = (SESSIONS_TRANSACTIONS.length - 1); i > -1; i--) {
            //alert(SESSIONS_TRANSACTIONS[i].transaction_id + ' vs ' + find_transaction_id);
            if (SESSIONS_TRANSACTIONS[i].transaction_id == find_transaction_id) {
                break;
            }
        }

        /* If an order is canceled, the drinks should are put back in the stock and available
        for other customers to purchase them*/
        for (j = 0 ; j < (SESSIONS_TRANSACTIONS[i].order.length); j++){
            for (m = 0 ; m < (SESSION_STOCK_INFO.length); m++){
                //alert("j: " + j + " m: " + m);
               //alert (SESSIONS_TRANSACTIONS[i].order[j] + ' vs ' + SESSION_STOCK_INFO[m].article_id);
                if (SESSION_STOCK_INFO[m].article_id == SESSIONS_TRANSACTIONS[i].order[j]){
                    //alert("Item found, ready to retrieve!")
                    //alert(SESSION_STOCK_INFO[j].toSource())
                    SESSION_STOCK_INFO[m].in_stock += SESSIONS_TRANSACTIONS[i].quantities[j]; // return to stock
                    //alert(SESSION_STOCK_INFO[j].toSource())
                }
            }
        }
  
        SESSIONS_TRANSACTIONS.splice(i, 1);
        //alert(SESSIONS_TRANSACTIONS.toSource());

        /* Save changes to session storage */
        sessionStorage.setItem("SESSION_TRANSACTIONS",JSON.stringify(SESSIONS_TRANSACTIONS));
        sessionStorage.setItem("SESSION_STOCK_INFO",JSON.stringify(SESSION_STOCK_INFO));


        rePrintTab(); // the pile closes up
        /* Undo-Redo */
        pushStateTo(done);  // update done stack
        clearUndone();      // clear undone stack after a 'proper' action

        /* Alert user*/
        showToast(title_delete_order[lang()], message_order_ref(find_transaction_id, lang()));
    });

    $(document).on('click','.pay',function() {
        var find_transaction_id = $(this).attr('id');     
        for (i = SESSIONS_TRANSACTIONS.length - 1; i > -1; i--) {
            //alert(SESSIONS_TRANSACTIONS[i].transaction_id + ' vs ' + find_transaction_id);
            if (SESSIONS_TRANSACTIONS[i].transaction_id == find_transaction_id) {
                break;
            }
        }
   
        //alert(SESSIONS_TRANSACTIONS[i].toSource())
        SESSIONS_TRANSACTIONS[i].paid = true;
        SESSIONS_TRANSACTIONS[i].bartender_id = current_bartender;
        //alert(SESSIONS_TRANSACTIONS[i].toSource())

        /* Save changes to session storage */
        sessionStorage.setItem("SESSION_TRANSACTIONS",JSON.stringify(SESSIONS_TRANSACTIONS));

        /* Update DOM */
        current_tab = "all";
        highlightTab("*#all");
        rePrintTab();
        
        /* Undo-Redo */
        pushStateTo(done);  // update done stack
        clearUndone();      // clear undone stack after a 'proper' action

        /* Alert user*/
        showToast(title_mark_paid[lang()], message_order_ref(find_transaction_id, lang()));
    });
    
    $(document).on('click','#undo',function() {
        undo();
        announce(undo_label[lang()]);
    });
    
    $(document).on('click','#redo',function() {
        redo();
        announce(redo_label[lang()]);
    });
    
});

function setOpen(card, open) {
    card.classList.toggle("active", open);
    card.setAttribute("aria-expanded", open);
}

// F11: an order is a playing card, a pile holds up to five. Index, name, total, time and state are the band you scan;
// the docket (lines, total, actions) opens in place. Indices are decoration, the accessible name is read from the sr-only parts.
function cardHTML (element) {
    var L = lang(), no = parseInt(element.transaction_id.slice(1), 10), time = element.timestamp.split(' ')[1].slice(0, 5);
    var idx = '<span class="pc_idx" aria-hidden="true"><b>' + no + '</b><i></i></span>', name = getCustomerName(element.customer_id);
    var state = paidStamp(element.paid, element);
    var content = '<div class="pc ' + (element.paid ? 'paid' : 'open') + '">' +
        '<button type="button" class="accordion ' + (element.paid ? 'order_paid' : 'order_open') + '" aria-expanded="false" id="'+ element.transaction_id +'">' +
        '<span class="sr-only">' + [order_word[L] + ' ' + no, name, time, total_word[L] + ' ' + element.amount + ' ' + kronor_word[L], stateText(element)].join(', ') + '</span>' +
        idx +
        '<span class="o_who" aria-hidden="true">' + name + '</span>' +
        '<span class="o_when" aria-hidden="true"><svg class="icon" aria-hidden="true"><use href="img/icons.svg#clock"/></svg>' + time + '</span>' +
        '<span class="o_sum" aria-hidden="true">' + element.amount + ':-</span>' +
        state + '</button>' +
        '<div class="panel"><div class="docket">' +
        '<div class="order" tabindex="0" role="region" aria-label="' + order_word[L] + ' ' + no + '">' +

        printOrder(element.order,element.quantities) + // Contents of the order printed here

        '</div>' +
        '<p class="total"><b>' + total_word[L] + '</b> ' + element.amount + ':-</p>';

    if (element.paid == false){ // this part is only printed to unpaid transactions
        content += '<div class="checkout">' +
            '<button type="button" class="small_button red delete cancel_order" id="' + element.transaction_id + '" >' + cancel_order[L] + '</button>' +
            '<button type="button" class="small_button light_green pay mark_paid" id="' + element.transaction_id + '" >' + mark_paid[L] + '</button>' +
            '</div>';
    } else {
        content += '<div class="paidfor"><p class="stamp">' + state_paid[L] + ' ' + paid_by_text(element) + '</p></div>';
    }

    return content + '</div></div>' +
        '<span class="pc_idx pc_idx_end" aria-hidden="true"><b>' + no + '</b><i></i></span></div>';
}

// piles of `size` cards, newest first, under one heading
function groupHTML (kind, heading, orders, size) {
    var piles = '';
    for (var i = 0; i < orders.length; i += size) {
        piles += '<div class="pile">' + $.map(orders.slice(i, i + size), cardHTML).join('') + '</div>';
    }
    return '<section class="group ' + kind + '"><h2>' + heading + '</h2><div class="piles">' + piles + '</div></section>';
}

function getBartenderName(bartender_id){
    var fullname = '';
    $.each(DB_BARTENDERS, function (element){
        if (this.bartender_id == bartender_id){
            fullname = this.first_name + ' ' + this.last_name;
        }
    });
    return fullname;
}

function getCustomerName(customer_id){
    var fullname = '';
    $.each(DB_CUSTOMERS, function (element){
        if (this.customer_id == customer_id){
            fullname = this.first_name + ' ' + this.last_name;
        }
    });
    return fullname;
}

function getBrevageName(brevage_id){
    var name = '';
    $.each(DB_STOCK, function (element){
        if (this.article_id == brevage_id){
            name = this.name;
        }
    });
    return name;
}

function getBrevagePrice(brevage_id){
    var price = 0;
    $.each(DB_STOCK, function (element){
        if (this.article_id == brevage_id){
            price = this.sale_price;
        }
    });
    return parseInt(price);
}

function paid_by_text (element) {
    var name = getBartenderName(element.bartender_id);
    return name ? '<small>' + paid_by[lang()] + ' ' + name + '</small>' : '<small>' + paid_credit[lang()] + '</small>';
}

function stateText (element) { // the stamp as plain text, for the card's accessible name
    return element.paid ? state_paid[lang()] + ' ' + $('<div>' + paid_by_text(element) + '</div>').text() : state_unpaid[lang()];
}

function paidStamp (boolean, element){
    if (boolean) return '<span class="o_state" aria-hidden="true">' + state_paid[lang()] + '</span>'; // who took the payment is on the docket stamp
    return '<span class="o_state" aria-hidden="true">' + state_unpaid[lang()] + '</span>';
}

function printOrder(order_array,quantities_array){
    var content = '';

    $.each(order_array, function (index,value){
        content += '<div class="order_details">' +
            '<b class="qty">' + quantities_array[index] + '×</b>' +
            '<h4>'+ getBrevageName(value) +'</h4>' +
            '<h4 class="price">'+ (getBrevagePrice(value) * quantities_array[index]) +':-</h4>' +
            '</div>';
    });
    return content;
}

/*ALL UNDO/REDO FUNCTIONS*/

function undo() {
    if (done.length <= 1) return; // keyboard can reach a faded button
    currentState = done.pop();
    previousState = done.pop();

    // change current state and update undo/redo stacks
    setStateTo(previousState);
    done.push(previousState);
    undone.push(currentState);

    // make sure undo/redo can/cant be clicked
    $("#redo").removeClass("fade");
    if (done.length <= 1) { $("#undo").addClass("fade"); }
  
    // reprint state
    rePrintTab();
}

function redo() {
    if (undone.length < 1) return;
    undoneState = undone.pop();

    // change current state and update undo/redo stacks
    setStateTo(undoneState);
    done.push(undoneState);

    // make sure undo/redo can/cant be clicked
    $("#undo").removeClass("fade");
    if (undone.length < 1) { $("#redo").addClass("fade"); }
    
    // reprint state
    rePrintTab();
}

function setStateTo(newState) {  // change the entire state beeing displayed
    // clear current state description
    SESSIONS_TRANSACTIONS = [];

    $("#all_orders").empty();

    // add the orders from the the newState
    $.each(newState, function(index, element) {        
        SESSIONS_TRANSACTIONS[index] = jQuery.extend(true, {}, this);      
    });
}

function pushStateTo(stack) {  // add an order instance to the done or undone stack
    var currentState = [];

    // clone every order in the session
    $.each(SESSIONS_TRANSACTIONS, function(index, element) {
        currentState[index] = jQuery.extend(true, {}, this); 
    });
    stack.push(currentState);
 
    // make sure undo/redo can/cant be clicked
    if (stack == done) { $("#undo").removeClass("fade");
    } else { $("#redo").removeClass("fade"); }
} 

function clearUndone() {
    undone = [];
    $("#redo").addClass("fade");
}

function rePrintTab() {   // reprint the currently displayed tab: waiting piles, then the paid pile(s)
    var newest = SESSIONS_TRANSACTIONS.slice().reverse(), html = '';
    var waiting = $.grep(newest, function(o) { return !o.paid; }), paid = $.grep(newest, function(o) { return o.paid; });
    if (current_tab != "paid" && waiting.length) html += groupHTML("waiting", pile_waiting[lang()], waiting, 5);
    if (current_tab != "unpaid" && paid.length) html += current_tab == "paid" ? groupHTML("paid", pile_paid[lang()], paid, 5) : groupHTML("paid", pile_paid[lang()], paid.slice(0, 6), 6);
    $("#all_orders").html(html);
}

// highlight the currently displayed tab 
function highlightTab(new_tab) {
    $(".menu_tabs button").not("#retrieve_orders").attr("aria-pressed", "false");
    $(new_tab).attr("aria-pressed", "true");
}

function updateTransactions() { // update the current transactions, local storage
    SESSIONS_TRANSACTIONS = JSON.parse(localStorage.getItem("SESSION"));  
    rePrintTab();
}

function translate (index) {
    $("#page_title").text(page_title[index]);
    $("#title").text(title[index]);
    $("#logout").text(logout[index]);
    $("#login_as").text(login_as[index]);
    $("#orders_q").text(orders_q[index]);
    $("#cancel_order").text(cancel_order[index]);
    $("#mark_paid").text(mark_paid[index]);
    $("#all").text(tab_all[index]);
    $("#unpaid").text(tab_unpaid[index]);
    $("#paid").text(tab_paid[index]);
    $(".update_label").text(tab_update[index]);
    $(".new_orders_label").text(new_orders_label[index]);
    rePrintTab(); // the cards are built with the language chosen
}
