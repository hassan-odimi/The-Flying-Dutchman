/** The Flying Dutchman
 *  index.js
 *  Created by 'Pirates of the Caribbean' on 11 of February 2018.
 *  Version 2.0 (October 2026): full visual redesign, accessibility and polish by Hassan Odimi.
 */

/*INDEX PAGE SCRIPTS
* All scripts related to the index page. Each page has their own scripts in a single js document.
* Methods translate() and responsive() are unique for each individual page.
*/

if (localStorage.getItem("index") == null){
    localStorage.setItem("index",0)
}

// login/gif related functions
function openLogin(elem, show, user) {
    localStorage.setItem('usertype', user);
    $("#overlay").removeClass("hidden");
    $('#loginBox').removeClass("hidden");
    sound("ghost-whoosh", 0.7);
    $('#user_name_input').focus(); // move keyboard users into the dialog
}

function closeLogin(){
    $("#overlay").addClass("hidden");
    $('#loginBox').addClass("hidden");
}

// the pirate flag dropped on the logo, or a press of it, crossfades to the ghost ship (css/index.css)
function toggleGhost(ev) {
    ev.preventDefault();
    var b = document.getElementById('summon');
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') != 'true');
}

function allowDrop(ev) { ev.preventDefault(); }

function drag(ev) { ev.dataTransfer.setData("text", ev.target.id);}

$(document).on('click','#about',function() {
    $("#passwords_window").addClass("hidden");
    $("#passwords").removeClass("full_length");

    $("#about").addClass("full_length");
    $("#about_window").removeClass("hidden");
    sound("ghost-whoosh", 0.7);

    $("#overlay").removeClass("hidden");
    hideToast(); // the toast would sit on the window; the live region already announced it
});

$(document).on('click','#passwords',function() {
    $("#about_window").addClass("hidden");
    $("#about").removeClass("full_length");

    $("#passwords_window").removeClass("hidden");
    $("#passwords").addClass("full_length");
    sound("ghost-whoosh", 0.7);

    $("#overlay").removeClass("hidden");
    hideToast(); // the toast would sit on the window; the live region already announced it
});

$(document).on('click','.close_window',function() {
    $("#about_window").addClass("hidden");
    $("#passwords_window").addClass("hidden");

    $("#about").removeClass("full_length");
    $("#passwords").removeClass("full_length");

    $("#overlay").addClass("hidden");
});

// V8: Use fills the login form for a demo account; the visitor still presses Log In
$(document).on('click','.use',function() {
    $("#passwords_window .close_window").click();
    openLogin('loginBox', 'block', this.dataset.role);
    $("#user_name_input").val(this.dataset.user);
    $("#password_input").val(this.dataset.pass).trigger("input"); // clears an old error
    $("#login").focus();
});

function translate (index) {
    $("#page_title").text(page_title[index]);
    $("#welcome").text(welcome[index]);
    $("#customer").text(customer[index]);
    $("#bartender").text(bartender[index]);
    $("#management").text(management[index]);
    $("#user_name").text(user_name[index]);
    $("#password").text(password[index]);
    $("#login").text(login[index]);
    $("#close, .close_window").attr("aria-label", close_label[index]);
    $("#summon_label").text(logo_alt[index] + ": " + summon_action[index]);
    $.each(["passwords_title", "demo_intro", "group_vip", "group_regular", "group_bartenders", "group_manager", "group_test"],
        function (i, id) { $("#" + id).text(window[id][index]); });
    $.each(["about_lede", "about_try_title", "about_built_title", "about_crew_title", "about_source"],
        function (i, id) { $("#" + id).text(window[id][index]); });
    $.each(["about_try", "about_built"],
        function (i, id) { $("#" + id + " li").each(function (n) { $(this).text(window[id][index][n]); }); });
    $.each(["use_label", "role_customer", "role_bartender", "role_manager"],
        function (i, c) { $("." + c).text(window[c][index]); });
}

// G2: the slips swing in the draught, About slow and heavy, Passwords quick with a paper flutter. Not on phones: there they are bottom buttons
var lastFlap = 0;
$(function () {
    if (matchMedia("(max-width: 768px)").matches) return;
    addSprings($("#about, #passwords"), [
        { max: 5, k: 14, c: 2.6, f: 330, sk: 0.03 },
        { max: 5, k: 26, c: 2.8, f: 190, sk: 0.14, flutter: 1 }
    ], function () {
        if (Date.now() - lastFlap < 2500) return; // a sweep across both slips is one sound
        lastFlap = Date.now();
        sound("paper-flap", 0.35);
    });
});
