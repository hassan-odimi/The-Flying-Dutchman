/** The Flying Dutchman
 *  login.js
 *  Created by 'Pirates of the Caribbean' on .. of February 2018.
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
    var page = window.location.pathname.split("/").pop().split(".")[0];
    var id = (localStorage.getItem("id") || "").slice(1);  // used to check if the user has unquestionale access
    if ((ut == page) || (ut == null && page == 'index') || page == 'index' || id == "€$#=@") {return;}
    else { // redirect to appropriate page if a user tries to access a page they are not allowed to
        toastAfterLoad(msg_access_denied[lang()], true);
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

    showToast(message, true);
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

function announce(message) {
    var live = $("#live");
    live.text(""); // clear first so a repeated message is read again
    setTimeout(function () { live.text(message); }, 50);
}

var toastTimer;
function showToast(message, isError) {
    announce(message);
    var toast = $("#toast");
    toast.toggleClass("is-error", !!isError).find(".toast_icon")
        .toggleClass("fa-check-circle", !isError).toggleClass("fa-exclamation-circle", !!isError);
    toast.find(".toast_text").text(message);
    toast.addClass("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000 + message.length * 60); // longer messages stay longer
}

function hideToast() { $("#toast").removeClass("is-open"); }

// for messages followed by a reload or redirect: shown on the next page
function toastAfterLoad(message, isError) {
    sessionStorage.setItem("toast", JSON.stringify([message, !!isError]));
}

// "Heineken added. Total: SEK 100:-" (customer and management order rows)
function announceOrder(article_id, word) {
    announce($.trim($("#name" + article_id).contents().first().text()) + " " + word + ". " + $("#total").text());
}

function logOut() { 
    localStorage.clear();
    window.location.href = "index.html";
}

// onload, check the users access and load the users name etc for display
$(function () {
    $("body").append('<div id="live" class="sr-only" aria-live="polite"></div>' +
        '<div class="toast_wrap"><div id="toast" class="toast t-toast" aria-hidden="true">' +
        '<i class="toast_icon fa fa-check-circle"></i><span class="toast_text"></span></div></div>');
    $("#toast").hover(function () { clearTimeout(toastTimer); }, function () { toastTimer = setTimeout(hideToast, 4000); });

    var pending = sessionStorage.getItem("toast");
    if (pending) {
        sessionStorage.removeItem("toast");
        pending = JSON.parse(pending);
        setTimeout(function () { showToast(pending[0], pending[1]); }, 300); // let the live region settle first
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
