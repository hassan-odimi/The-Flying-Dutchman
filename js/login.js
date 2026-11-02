/** The Flying Dutchman
 *  login.js
 *  Created by 'Pirates of the Caribbean' on .. of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
 */

/*LOGIN PAGE SCRIPTS
* All scripts related to the login. Each page uses this script to keep track of the logged in user and their allowed access.
*/

/* login functions */

var user = "blank";

function findByID(id, db) { // assuming 'id' is the first objectvalue    
    var new_user;
    $.each(db, function(element) {
        var found = false;
        $.each(this, function(element) {
            if (this == id) { found = true; return false;}            
        });
        if (found == true) { new_user = this; return false; }
    });
    return new_user;
}

function typeToDB(usertype) {
    if (usertype == 'customer')   { return DB_CUSTOMERS;}
    if (usertype == 'bartender')  { return DB_BARTENDERS;}
    if (usertype == 'management') { return DB_MANAGERS;}
}

// direct the user to correct page on login
function goToUserPage(usertype) {
    if      (usertype == 'customer')   { window.location.href = "customer.html";}
    else if (usertype == 'bartender')  { window.location.href = "bartender.html";}
    else if (usertype == 'management') { window.location.href = "management.html";}
    else { window.location.href = "index.html";}
}

// login the user if they have valid credentials
function loginDB(form) {
    var username = form.user_name.value;
    var password = form.password.value;
    var db = typeToDB(localStorage.getItem('usertype'));
    
    $.each(db, function(index, element) {
        if (this.username == username) {
            if (this.password == password) {
                user = this;
                $.each(this, function(element) {
                   localStorage.setItem('id', this); return false;                    
                });
                goToUserPage(localStorage.getItem('usertype')); // redirect to appropriate page 
            } else { loginError(form.password, msg_wrong_password[lang()]); return false; }
            return false;
        }
        if (index + 1 == db.length) { loginError(form.user_name, msg_wrong_username[lang()]); }
    });   
}

// check if the currently logged in user have the proper level of access to use the current page
function checkAccess() {    
    var ut = localStorage.getItem('usertype');
    var page = window.location.pathname.split("/").pop().split(".")[0] || "index"; // "/" has no file name
    var id = (localStorage.getItem("id") || "").slice(1);  // used to check if the user has unquestionale access
    if ((ut == page) || (ut == null && page == 'index') || page == 'index' || id == "€$#=@") {return;}
    else { // redirect to appropriate page if a user tries to access a page they are not allowed to
        toastAfterLoad(title_access_denied[lang()], msg_access_denied[lang()], true);
        goToUserPage(ut);
    }
}

// show the error under the login form, mark and shake the wrong field (transitions-dev error shake)
function loginError(field, message) {
    $(field.form).addClass("is-error").find(".t-input").removeClass("is-error").removeAttr("aria-invalid");
    $(field).addClass("is-error").attr("aria-invalid", "true");
    $("#login_error_text").text(message);

    field.classList.remove("is-shaking");
    void field.offsetWidth; // reflow so the shake replays
    field.classList.add("is-shaking");
    setTimeout(function () { field.classList.remove("is-shaking"); }, 300);

    showToast(title_login_failed[lang()], message, true);
}

// typing clears the error
$(document).on("input", ".t-input", function () {
    $(this.form).removeClass("is-error").find(".t-input").removeClass("is-error").removeAttr("aria-invalid");
});

/* FEEDBACK
* One polite live region carries every message to screen readers. The toast repeats it visually
* and is aria-hidden, so nothing is read twice.
*/
function lang() { return parseInt(localStorage.getItem("index")) || 0; }

function soundOn() { return localStorage.getItem("SOUND") == "on"; }
function setSound(on) {
    localStorage.setItem("SOUND", on ? "on" : "off");
    $("#sound").attr("aria-pressed", on).find("use").attr("href", "img/icons.svg#" + (on ? "bell" : "bell-off"));
    $("#sound_wait").prop("hidden", !(on && navigator.userActivation && !navigator.userActivation.hasBeenActive)); // sound is on, but the browser still refuses audio
    placeWait();
}

// V12 ambience (customer page only): the storm outside, a loop that plays only while the Sound plate is on.
// It starts at a press or key (the plate's own click is one), never on load, and stops with the plate or while the tab is hidden
var ambience, ambient = false;
function setAmbience(on) {
    ambient = on;
    ambience = ambience || Object.assign(new Audio("audio/ambience.mp3"), { loop: true, volume: 0.25 });
    if (on && !document.hidden) ambience.play().catch(function () {}); else ambience.pause();
}

// the note sits just above the plate. It is placed by script because a positioned footer would move the phone's Undo and Redo, which hang from the page
function placeWait() {
    var note = $("#sound_wait"), box = $("#sound")[0].getBoundingClientRect(), w = note.outerWidth();
    note.css({ left: Math.min(Math.max(box.right - w, 12), document.documentElement.clientWidth - w - 12), top: box.top + scrollY - note.outerHeight() - 8 });
}

// V12 sound cues: off unless the Sound plate is on. Browsers allow audio only after a press or key on the page,
// so an earlier cue plays nothing (play() is refused) and the visual and spoken signals carry the event alone
function sound(name) {
    if (!soundOn()) return;
    var cue = new Audio("audio/" + name + ".mp3");
    cue.volume = 0.6;
    cue.play().catch(function () {});
}

function announce(message) {
    var live = $("#live");
    live.text(""); // clear first so a repeated message is read again
    setTimeout(function () { live.text(message); }, 50);
}

var toastTimer;
function showToast(title, detail, isError) {
    announce(title + (detail ? ". " + detail : ""));
    var toast = $("#toast");
    toast.toggleClass("is-error", !!isError);
    toast.find(".toast_title").text(title);
    toast.find(".toast_detail").text(detail || "");
    toast.addClass("is-open");
    $(".toast_wrap")[0].getAnimations({ subtree: true }).forEach(function (a) { a.currentTime = 0; }); // the mist drifts 5 s from each new toast
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000 + (title.length + (detail || "").length) * 60); // longer messages stay longer
}

function hideToast() { $("#toast").removeClass("is-open"); }

// for messages followed by a reload or redirect: shown on the next page
function toastAfterLoad(title, detail, isError) {
    sessionStorage.setItem("toast", JSON.stringify([title, detail, !!isError]));
}

// "Heineken added. Total: SEK 100:-" (customer and management order rows)
function announceOrder(article_id, word) {
    announce($.trim($("#name" + article_id).contents().first().text()) + " " + word + ". " + $("#total").text());
}

function logOut() { 
    var receipt_no = localStorage.getItem("STOCK_ORDER_NO"); // the stock order numbers run on across log outs
    var sound_choice = localStorage.getItem("SOUND"); // and the sound choice stays with the browser
    localStorage.clear();
    if (receipt_no) localStorage.setItem("STOCK_ORDER_NO", receipt_no);
    if (sound_choice) localStorage.setItem("SOUND", sound_choice);
    window.location.href = "index.html";
}

// onload, check the users access and load the users name etc for display
$(function () {
    $("body").append('<div id="live" class="sr-only" aria-live="polite"></div>' +
        '<div class="toast_wrap"><div id="toast" class="toast t-toast" aria-hidden="true">' +
        '<span class="toast_ribbon"></span><span class="toast_icon"></span><span class="toast_text"><b class="toast_title"></b><span class="toast_detail"></span></span></div></div>');
    var plate = $('<button type="button" id="sound" class="small_button" aria-pressed="false">' +
        '<svg class="icon" aria-hidden="true"><use href="img/icons.svg#bell-off"/></svg> <span class="sound_label"></span></button>');
    if ($("#logout").length) plate.insertAfter("#logout"); else $("footer").first().append(plate); // beside Log Out; the landing page has none
    plate.after('<small id="sound_wait" class="sound_wait" hidden></small>');
    $(".sound_label").text(sound_label[lang()]); // login.js runs after multilanguage.js has set the language, so set the words here too
    $(".sound_wait").text(sound_wait[lang()]);
    setSound(soundOn());
    $(window).on("load resize", placeWait);
    var customer = /customer\.html$/.test(location.pathname);
    $(document).one("pointerup keydown", function (e) { // pointerup: on a touch screen a press counts as a gesture when the finger lifts
        $("#sound_wait").prop("hidden", true);
        if (customer && soundOn() && !$(e.target).closest("#sound").length) setAmbience(true); // sound was left on: the first press starts it
    });
    if (customer) document.addEventListener("visibilitychange", function () { if (ambience) setAmbience(ambient); });
    $(document).on("click", "#sound", function () { setSound(!soundOn()); if (customer) setAmbience(soundOn()); });
    $("#toast").hover(function () { clearTimeout(toastTimer); }, function () { toastTimer = setTimeout(hideToast, 4000); });

    var pending = sessionStorage.getItem("toast");
    if (pending) {
        sessionStorage.removeItem("toast");
        pending = JSON.parse(pending);
        setTimeout(function () { showToast(pending[0], pending[1], pending[2]); }, 300); // let the live region settle first
    }

    // mirror the visual .fade state of undo/redo into aria-disabled
    $("#undo, #redo").each(function () {
        var button = this;
        var sync = function () { button.setAttribute("aria-disabled", button.classList.contains("fade")); };
        new MutationObserver(sync).observe(button, {attributes: true, attributeFilter: ["class"]});
        sync();
    });

    checkAccess();
    user = findByID(localStorage.getItem("id"), typeToDB(localStorage.getItem("usertype")));
    if (!user) { return; } // index page: nobody logged in yet
    
    if (!(user.vip)) {
        $('#specials').hide();
        $('#creditDisplay').hide();
    }
   
    $('#usr').html(user.first_name);
    $('#cre').html(user.credit);
});
