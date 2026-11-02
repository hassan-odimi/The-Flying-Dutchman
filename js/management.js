/** The Flying Dutchman
 *  management.js
 *  Created by 'Pirates of the Caribbean' on 11 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
 */

/*MANAGEMENT PAGE SCRIPTS
* All scripts related to the management page. Each page has their own scripts in a single js document.
* Method translate() is unique for each individual page and can be found at the bottom of each script.
*/

var big_orders = []; // keeps list of drinks ordered
var big_quantity = []; // keeps list of quantities with matching indexes
var big_total = 0; // calculates the big_total

var current_manager = localStorage.getItem('id');
var current_tab = "drinks_list";

/*UNDO-REDO ARRAYS*/
var done = new Array([]);    //keeps track of 'done' actions
var undone = new Array(); //keeps track of 'redone' actions

$(document).ready(function() {

    //addBackground();
    retrieveSystembolaget(); // load database on page load
    ghostIntro();            // V12b G3: the cards condense out of fog, the first time only
    highlightTab("drinks_list");
    
    $("#drinks_list").click(function(){ /* Retrieve from Systembolaget*/
        highlightTab("drinks_list");
        showTab(retrieveSystembolaget);
    });

    $("#specials_db").click(function(){ /* Retrieve from Mike's Specials*/
        highlightTab("specials_db");
        showTab(function(){
            $.each(DB_MIKES, function(element){
                printToDOM(this);
            });
        });
    });

    $("#check_stock").click(function(){ /* Retrieve in stock*/
        highlightTab("check_stock");
        showTab(function(){
            $.each(DB_SYSTEMBOLAGET, function(element){
                if (checkStock(this.artikelid) > 0){
                    printToDOM(this);
                };
            });
        });
    });

    $("#shortage_alert").click(function(){ /* Retrieve on shortage alert*/
        highlightTab("shortage_alert");
        showTab(function(){
            $.each(DB_SYSTEMBOLAGET, function(element){
                if (checkStock(this.artikelid) > 0 && checkStock(this.artikelid) < 15){
                    printToDOM(this);}
            });

            $.each(DB_MIKES, function(element){
                if (checkStock(this.artikelid) > 0 && checkStock(this.artikelid) < 15){
                    printToDOM(this);}
            });
        });
    });


    $(document).on('click','#add1',function(){
        var article_id = $(this).parent().find('span[hidden]').html();
        addOrder(article_id, 1);

        //Undo-Redo
        pushOrderTo(done); // update done stack
        clearUndone();     // clear undone stack after a 'proper' action
        announceOrder(article_id, msg_added[lang()]);
    });

    $(document).on('click','#add10',function(){
        var article_id = $(this).parent().find('span[hidden]').html();
        addOrder(article_id, 10);

        //Undo-Redo
        pushOrderTo(done); // update done stack
        clearUndone();     // clear undone stack after a 'proper' action
        announceOrder(article_id, msg_added[lang()]);
    });

    $(document).on('click','#add100',function(){
        var article_id = $(this).parent().find('span[hidden]').html();
        addOrder(article_id, 100);

        //Undo-Redo
        pushOrderTo(done); // update done stack
        clearUndone();     // clear undone stack after a 'proper' action
        announceOrder(article_id, msg_added[lang()]);
    });

    $("#pay").click(function(){

        if (big_orders.length > 0){
            orders_counter ++;

            var newBigOrder = {
                "order_id": "R" + ((orders_counter + 100000).toString()).slice(1),
                "manager_id": current_manager,
                "order": big_orders,
                "quantities": big_quantity,
                "amount": big_total,
                "timestamp": formatDate(new Date($.now()))
            };
            SESSIONS_ORDERS.push(newBigOrder);

            var flag;
            for (i = 0 ; i < (big_orders.length); i++){
                flag = true;
                for (j = 0 ; j < (SESSION_STOCK_INFO.length); j++){
                    if (SESSION_STOCK_INFO[j].article_id == big_orders[i]){
                        flag = false;
                        SESSION_STOCK_INFO[j].in_stock += big_quantity[i]; // if already in stock update stock
                    }
                }

                if (flag){ // if not in stock add object to array
                    //alert("Not currently in stock!");

                    var drinkIndex= getDrinkIndex(big_orders[i]);

                    is_wine = ((DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("vin") >= 0 ||
                              (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("fruktvin") >= 0 ||
                              (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("shiraz") >= 0 ||
                              (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("pinot") >= 0 ||
                              (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("rött vin") >= 0 ||
                              (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("vitt vin") >= 0 ||
                              (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("champagne") >= 0);

                    is_beer = ((DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("öl") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("larger") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("pale") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("stout") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("ale") >= 0 );

                    is_spirit = ((DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("vodka") >= 0) ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("cognac") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("bourbon") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("cider") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("gin") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("rom") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("sprit") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("blended") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("whiskey") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("whisky") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("sake") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("aquavit") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("chartreuse") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("likör") >= 0 ||
                        (DB_SYSTEMBOLAGET[drinkIndex].varugrupp).toLowerCase().indexOf("malt") >= 0;

                    var newObject = {
                        "article_id": DB_SYSTEMBOLAGET[drinkIndex].artikelid, // same as Sytembolaget
                        "name": DB_SYSTEMBOLAGET[drinkIndex].namn +  ' ' + DB_SYSTEMBOLAGET[drinkIndex].namn2,
                        "beer": is_beer,
                        "wine": is_wine,
                        "spirit":is_spirit,
                        "year": DB_SYSTEMBOLAGET[drinkIndex].year,
                        "country": DB_SYSTEMBOLAGET[drinkIndex].ursprunglandnamn,
                        "volume_ml": DB_SYSTEMBOLAGET[drinkIndex].volymiml,
                        "alcohol_percentage": DB_SYSTEMBOLAGET[drinkIndex].alkoholhalt,
                        "sale_price": DB_SYSTEMBOLAGET[drinkIndex].prisinklmoms,
                        "in_stock": big_quantity[i],
                        "kosher": (DB_SYSTEMBOLAGET[drinkIndex].kosher == "1"),
                        "ecologic": (DB_SYSTEMBOLAGET[drinkIndex].ekologisk == "1"),
                        "special": false // all special drinks are already on the database!
                    };
                    SESSION_STOCK_INFO.push(newObject);
                }
            }

            sessionStorage.setItem("SESSION_ORDERS",JSON.stringify(SESSIONS_ORDERS));
            sessionStorage.setItem("orders_counter", orders_counter);
            sessionStorage.setItem("SESSION_STOCK_INFO",JSON.stringify(SESSION_STOCK_INFO));

            var lines = $("#drink_selection .order").map(function () {
                var row = $(this);
                return {name: row.children("h4").not(".price").text(), qty: row.find(".qty").text(), price: row.find(".price").text()};
            }).get();
            var receipt_sum = big_total;

            resetPage();
            var no = showReceipt(lines, receipt_sum);
            showToast(title_placed_order[lang()], message_receipt(no, receipt_sum, lang()));
            setTimeout(function () { sound("stamp"); }, 350 + 119); // ORDERED comes down 350 ms after the slip lands and touches the paper 119 ms into its press

        } else { showToast(title_empty_order[lang()], message_empty_order[lang()], true); }

    });

    $(document).on('click','.receipt_new',function(){
        $(this).closest('.receipt').remove();
        var first = $('#drink_database .add_button').first();
        (first.length ? first : $('#pay')).focus(); // back to the list
    });

    $(document).on('click','.delete',function(){

        big_total-= $(this).closest('.order').find('.hiden_price_sum').html(); // deduct from total
        updateTotal();

        var article_id = $(this).closest('.order').attr('id'); // get id
        var i = $.inArray(article_id,big_orders);

        big_orders.splice(i, 1); // remove both order and quantity (same index)
        big_quantity.splice(i, 1);

        announceOrder(article_id, msg_removed[lang()]);
        var row = $(this).closest('.order');
        var next = row.next('.order').find('.delete');
        if (!next.length) next = row.prev('.order').find('.delete');
        if (!next.length) next = $('[id=pay]:visible');
        row.remove(); // remove from DOM
        next.focus(); // keep keyboard users in the order list

        //Undo-Redo
        pushOrderTo(done); // update done stack
        clearUndone();     // clear undone stack after a 'proper' action
    });

    //UNDO REDO BUTTONS
    $(document).on('click','#undo',function() {
        undo();
        announce(undo_label[lang()] + ". " + $("#total").text());
    });

    $(document).on('click','#redo',function() {
        redo();
        announce(redo_label[lang()] + ". " + $("#total").text());
    });
});

function retrieveSystembolaget() {
    $.each(DB_SYSTEMBOLAGET, function(element) { printToDOM(this); });
}

// check in_stock for the given article_id
function checkStock (article_id) {
    var counter = 0;
    $.each(SESSION_STOCK_INFO, function(element) {
        if (this.article_id == article_id) {
            counter = this.in_stock;
        }
    });
    return counter;
}

// stocked before, now at 0: the bar may want to reorder it. A drink the bar never carried is also 0, but is not in the stock list
function soldOut (article_id) {
    return checkStock(article_id) == 0 && SESSION_STOCK_INFO.some(function (s) { return s.article_id == article_id; });
}

function sealRim (index) { // the name twice round the rim
    var t = not_stocked[index].toUpperCase();
    return t + ' · ' + t + ' ·';
}

// A round sepia postmark with the anchor in the middle. The rim text is decoration; the sr-only text is what is read
function notStockedSeal () {
    return '<div class="seal"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48"/><circle cx="50" cy="50" r="27"/>' +
        '<text><textPath class="seal_txt" href="#seal_rim" textLength="224" lengthAdjust="spacing">' + sealRim(lang()) + '</textPath></text></svg>' +
        '<i aria-hidden="true"></i><span class="sr-only not_stocked">' + not_stocked[lang()] + '</span></div>';
}

// A drink the bar never carried: the seal's dashed pair, an unprinted place. Its words are visible text, the + is decoration
function catalogueSlot () {
    return '<div class="slot"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48"/></svg>' +
        '<b aria-hidden="true">+</b><span class="catalogue_only">' + catalogue_only[lang()] + '</span></div>';
}

function printToDOM (element) {

    var classes = '';

    if (checkStock(element.artikelid) < 15) {
        classes = ' class ="textRed"';
    }

    if (checkStock(element.artikelid) == 0) {
        classes = ' class ="textLightGreen"';
    }

    if (checkStock(element.artikelid) >= 15) {
        classes = ' class ="textDarkGreen"';
    }

    $("#drink_database").append(
        '<div class="drink" data-id="' + element.artikelid + '">'+

        '<div class="c1">' +
        '<img src="img/drinks/' + element.artikelid + '.webp" alt="" loading="lazy">' +
        '</div>' +

        '<div class="c2">'+
        '<b class="drink_name">' + drink_name[lang()] + '</b> <span id="dn' + element.artikelid + '">' + element.namn + ' ' + element.namn2 + '</span><br>' +
        '<b class="type">' + type[lang()] + '</b> ' + element.varugrupp + '<br>' +
        '<b class="price">' + price[lang()] + '</b> SEK ' + parseInt(element.prisinklmoms) + ':-<br>' +
        '<b class="country">' + country[lang()] + '</b> ' + element.ursprunglandnamn + '<br>' +
        (element.volymiml != null ? '<b class="volume">' + volume[lang()] + '</b> ' + element.volymiml + '<br>' : '') +
        '<b class="alcohol">' + alcohol[lang()] + '</b> ' + element.alkoholhalt + '<br>' +
        '<b class="drink_id">' + drink_id[lang()] + '</b> '+ element.artikelid +'<br>' +
        '<b class="producer">' + producer[lang()] + '</b> '+ element.producent +'<br>' +
        '<b class="delivery">' + delivery[lang()] + '</b> '+ element.leverantor +'<br>' +
        (element.prisperliter != null ? '<b class="cost">' + cost[lang()] + '</b> SEK '+ element.prisperliter + '<br>' : '') +
        '</div>' +

        '<div class="c3">' + (soldOut(element.artikelid) ? notStockedSeal() : checkStock(element.artikelid) == 0 ? catalogueSlot() :
        '<h2 '+ classes +'><span class="inStock">' + inStock[lang()] + '</span> '+ checkStock(element.artikelid) +'</h2>') +
        '</div>' +

        '<div class="c4">' +
        '<button type="button" class="add_button" id="add1" aria-labelledby="a1_' + element.artikelid + ' dn' + element.artikelid + '"><span class="h4 add_one" id="a1_' + element.artikelid + '">' + add_one[lang()] + '</span></button>' +
        '<button type="button" class="add_button" id="add10" aria-labelledby="a10_' + element.artikelid + ' dn' + element.artikelid + '"><span class="h4 add_ten" id="a10_' + element.artikelid + '">' + add_ten[lang()] + '</span></button>' +
        '<button type="button" class="add_button" id="add100" aria-labelledby="a100_' + element.artikelid + ' dn' + element.artikelid + '"><span class="h4 add_hundred" id="a100_' + element.artikelid + '">' + add_hundred[lang()] + '</span></button>' +
        '<span hidden>' + element.artikelid + '</span>'+
        '<span hidden>' + element.prisinklmoms +'</span>'+
        '</div>'+
        '</div>'
    );
}

function addOrder (article_id, number) {
    i = -1;//$.inArray(article_id, big_orders);
    $.each(big_orders, function(index, element){ if (this == article_id) { i = index; return false;}});

    if (i == -1){ // if drink is not already on the big_orders print to DOM

        $("#drink_selection .receipt").remove(); // the first new Add clears the last receipt
        $.each(DB_SYSTEMBOLAGET.concat(DB_MIKES), function(element){ // the database, then the specials
            if (this.artikelid == article_id){ // retrieve article from the database
                $("#drink_selection").prepend(
                    '<div class="order laid" id="'+ this.artikelid +'">' +
                    '<b class="qty">' + number + '\u00d7</b>' +
                    '<button type="button" class="delete" aria-labelledby="remove_word name' + this.artikelid + '"><svg class="icon" aria-hidden="true"><use href="img/icons.svg#cross-brush"/></svg></button>' +
                    '<h4 class="price">SEK <span class="hiden_price_sum">' + (parseInt(this.prisinklmoms) * number) + '</span>:-</h4>' +
                    '<span class="sum" hidden>' + parseInt(this.prisinklmoms) + '</span>' +
                    '<img src="img/drinks/' + this.artikelid + '.webp" alt="" loading="lazy">' +
                    '<h4 id="name' + this.artikelid + '">' + this.namn + ' ' + this.namn2 + '</h4>' +
                    '</div>'
                )
                big_total += parseInt(this.prisinklmoms) * number;
            }
        });

        big_orders.push(article_id);
        big_quantity.push(number);

    } else { // if the drink is already in the order, update counter on DOM
        big_quantity[i]+= number;

        big_total += parseInt($("#"+article_id).find('.sum').html()) * number;

        $("#"+article_id).find('.qty').text(big_quantity[i] + '\u00d7');

        update_price = parseInt($("#"+article_id).find('.sum').html()) * big_quantity[i];
        $("#"+article_id).find('.hiden_price_sum').empty().append(update_price);
    }

    updateTotal();
    //FOR TESTING PURPOSES
    //alert (big_orders +' X '+big_quantity)
}

// F13: the receipt slip replaces the empty ledger; returns the running number, "0042"
function showReceipt (lines, total) {
    var no = ("000" + ((parseInt(localStorage.getItem("STOCK_ORDER_NO")) || 0) + 1)).slice(-4);
    localStorage.setItem("STOCK_ORDER_NO", parseInt(no, 10));

    var list = $('<ul class="receipt_lines">');
    $.each(lines, function () {
        list.append($('<li>').append($('<span>').text(this.name), $('<b>').text(this.qty), $('<span class="receipt_price">').text(this.price)));
    });

    $("#drink_selection").append(
        $('<div class="receipt">').append(
            $('<section class="receipt_slip" aria-labelledby="receipt_head">').append(
                $('<h3 id="receipt_head" class="receipt_head">').append($('<span class="receipt_title">'), ' ', $('<b>').text('#' + no)),
                $('<time class="receipt_time">').attr("datetime", new Date().toISOString()),
                list,
                $('<p class="receipt_sum">').append($('<span class="receipt_total">'), $('<b>').text('SEK ' + total + ':-')),
                $('<p class="receipt_stamp">'),
                $('<p class="receipt_note">'),
                $('<button type="button" class="small_button blue receipt_new">')
            )
        )
    );
    translateReceipt(lang());
    return no;
}

function translateReceipt (index) {
    $(".receipt_title").text(receipt_title[index]);
    $(".receipt_total").text(receipt_total[index]);
    $(".receipt_stamp").text(receipt_stamp[index]);
    $(".receipt_note").text(receipt_note[index]);
    $(".receipt_new").text(receipt_new[index]);
    $(".receipt_time").each(function () {
        $(this).text(new Date($(this).attr("datetime")).toLocaleString(receipt_locale[index], {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"}));
    });
}

function updateTotal (index){
    $('#total').empty().append(total_label[index === undefined ? lang() : index] + ' SEK ' + Math.max(big_total,0) + ':-')
};

function formatDate (date) {
    /* Returns formatted date as follows: "2018-03-19 21:00:00" */
    var formatted_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-"
        + date.getDate() +" "+ date.getHours() +":"+ date.getMinutes()+ ":" + date.getSeconds();
    return formatted_date;
}

/*ALL UNDO/REDO FUNCTIONS*/

function undo() {
    if (done.length <= 1) return; // keyboard can reach a faded button
    currentOrder = done.pop();
    previousOrder = done.pop();

    // change current order and update undo/redo stacks
    setOrderTo(previousOrder);
    done.push(previousOrder);
    undone.push(currentOrder);

    // make sure undo/redo can/cant be clicked
    $("#redo").removeClass("fade");
    if (done.length <= 1) { $("#undo").addClass("fade"); }
}

function redo() {
    if (undone.length < 1) return;
    undoneOrder = undone.pop();

    // change current order and update undo/redo stacks
    setOrderTo(undoneOrder);
    done.push(undoneOrder);

    // make sure undo/redo can/cant be clicked
    $("#undo").removeClass("fade");
    if (undone.length < 1) { $("#redo").addClass("fade"); }
}


function setOrderTo(newOrder) {  // change the entire order beeing displayed
    // clear current order description
    big_orders = [];
    big_quantity = [];
    big_total = 0;
    $(drink_selection).empty();

    // add the beers from the newOrder
    $.each(newOrder[0], function(i) {addOrder(this, newOrder[1][i]); });
    $("#drink_selection .order").removeClass("laid"); // undo/redo rewrite the ledger; only a new line is laid down
    updateTotal();
}

function pushOrderTo(stack) {  // add an order instance to the done or undone stack
    var currentOrder = [];
    currentOrder[0] = big_orders.slice();
    currentOrder[1] = big_quantity.slice();
    stack.push(currentOrder);
    updateTotal();

    // make sure undo/redo can/cant be clicked
    if (stack == done) { $("#undo").removeClass("fade");
    } else { $("#redo").removeClass("fade"); }
}

function getDrinkIndex (id) { // get the id of a beverage in the DB_SYSTEMBOLAGET
    for (index = 0; index < DB_SYSTEMBOLAGET.length; index++){
        if (parseInt(DB_SYSTEMBOLAGET[index].artikelid) == id){
            return index;
        }
    }
    return -1;
}

function clearUndone() {
    undone = [];
    $("#redo").addClass("fade");
}

/*
function addBackground () {
    $("#drink_database").append('<div class="background_wallpaper"></div>');
}*/

function resetPage() {
    big_orders = [];
    big_quantity = [];
    big_total = 0;
    $("#drink_selection").empty();
    updateTotal();

    done = new Array([]);
    undone = new Array();
    $("#undo").addClass("fade");
    $("#redo").addClass("fade");

    $("#" + current_tab).click(); // reprint the open tab so the new stock counts show
}

// highlight the currently displayed tab 
// V12b G4: the spectral trail runs the tab's own empty-and-print
function showTab(fill) {
    ghostSwap(function(){
        $("#drink_database").empty();
        fill();
    });
}

function highlightTab(new_tab) {
    $(".type_menu button").attr("aria-pressed", "false");
    $('#' + new_tab).attr("aria-pressed", "true");
    current_tab = new_tab;
}

function translate (index) {
    $("#page_title").text(page_title[index]);
    $("#title").text(title[index]);
    $("#drink_database").attr("aria-label", drinks_region[index]);
    $("#logout").text(logout[index]);
    $("#stock_order").text(stock_order[index]);
    $("#login_as").text(login_as[index]);

    $("#drinks_list").text(drinks_list[index]);
    $("#check_stock").text(check_stock[index]);
    $("#shortage_alert").text(shortage_alert[index]);

    // Translating the drink's details
    $(".drink_name").text(drink_name[index]);
    $(".type").text(type[index]);
    $(".drink .price").text(price[index]);
    $(".country").text(country[index]);
    $(".volume").text(volume[index]);
    $(".alcohol").text(alcohol[index]);
    $(".drink_id").text(drink_id[index]);
    $(".producer").text(producer[index]);
    $(".delivery").text(delivery[index]);
    $(".cost").text(cost[index]);
    // <end> Translating the drink's details

    $(".inStock").text(inStock[index]);
    $(".not_stocked").text(not_stocked[index]);
    $(".seal_txt").text(sealRim(index));
    $(".catalogue_only").text(catalogue_only[index]);
    $(".add_one").text(add_one[index]);
    $(".add_ten").text(add_ten[index]);
    $(".add_hundred").text(add_hundred[index]);

    $("#big_total").text(big_total[index]);
    $("#pay").text(pay[index]);
    $("#your_order").text(your_order[index]);
    updateTotal(index);
    translateReceipt(index);
}
