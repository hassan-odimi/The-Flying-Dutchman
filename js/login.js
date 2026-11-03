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

// direct the user to correct page on login. instant: no foghorn and no wait (an access-denied redirect)
function goToUserPage(usertype, instant) {
    var pages = { customer: "customer.html", bartender: "bartender.html", management: "management.html" };
    var url = Object.hasOwn(pages, usertype) ? pages[usertype] : "index.html"; // own keys only: a stored "constructor" must not become a URL
    if (instant) window.location.href = url; else depart(url);
}

// V12b G5: the foghorn plays here, on the old page, at the press (a gesture, so the browser allows it). The page waits for the
// whole horn (2.85 s), because leaving the page stops the sound. The page fades into the fog meanwhile (css/style.css, html.departing),
// so the wait is not a frozen screen. Sound off: no wait
function depart(url) {
    if (!soundOn()) { window.location.href = url; return; }
    sound("foghorn", 0.8);
    document.body.inert = true; // the old page is leaving: no press during the wait acts on a cleared session, and a second press cannot restart it
    document.documentElement.classList.add("departing");
    var bank = mistBank(); // fog.js: crosses the fading page, and is gone before the view transition takes its snapshot
    setTimeout(function () { bank.remove(); window.location.href = url; }, 2900);
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
        goToUserPage(ut, true);
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
function sound(name, volume, from) { // from: seconds into the cue
    if (!soundOn()) return;
    var cue = new Audio("audio/" + name + ".mp3");
    cue.volume = volume || 0.6;
    if (from) cue.currentTime = from;
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
    depart("index.html");
}

// V12b wind (G1, G2): each item is a damped spring that a pointer or focus pushes into a gusting breeze, so cloth and paper swing and settle.
// feel: max deg, k stiffness, c damping, f gust period in ms, sk skew from velocity, flutter for thin paper. A neighbour gets 35 % of the push.
// It writes only `transform` (rotate, skewX); the cord's sag uses the rotate and translate properties. Reduced motion: nothing moves.
var springs = [], windRunning = false, windLast = 0;
function addSprings(items, feel, onGust) {
    var set = $.map(items, function (el, i) { return $.extend({ el: el, a: 0, v: 0, push: 0 }, feel[i] || feel); });
    $.each(set, function (i, s) {
        var on = function () {
            if (!s.push) { s.t0 = performance.now(); if (onGust) onGust(s); }
            s.push = 1;
            $.each([set[i - 1], set[i + 1]], function (_, n) { if (n) n.v += 0.35 * 45; });
            windKick();
        };
        var off = function () { s.push = 0; };
        var key = $(s.el).closest("a, button")[0]; // focus lands on the link or button around the cloth
        s.el.addEventListener("pointerenter", on); key.addEventListener("focus", on);
        s.el.addEventListener("pointerleave", off); key.addEventListener("blur", off);
    });
    springs = springs.concat(set);
}
function windKick() {
    if (windRunning || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    windRunning = true; windLast = performance.now();
    requestAnimationFrame(windStep);
}
function windStep(now) {
    var dt = Math.max(0, Math.min(0.033, (now - windLast) / 1000)), moving = false; // the first frame can carry a timestamp older than windKick's
    windLast = now;
    $.each(springs, function (_, s) {
        var live = s.push ? Math.max(0, Math.min(1, (5500 - (now - s.t0)) / 1000)) : 0; // the breeze dies away between 4.5 and 5.5 s, however long the pointer or focus stays
        var gust = s.max * 0.75 * (1 + 0.5 * Math.sin(now / s.f + s.max)) * live; // a gusting breeze while pointed at
        s.v += (-s.k * (s.a - gust) - s.c * s.v) * dt;
        s.a = Math.max(-s.max, Math.min(s.max, s.a + s.v * dt));
        var ripple = -s.v * s.sk + (s.flutter ? Math.sin(now / 45) * Math.min(1, Math.abs(s.v) / 20) * 1.5 : 0); // the edge lags the swing; paper also flutters
        s.el.style.transform = "rotate(" + s.a.toFixed(2) + "deg) skewX(" + ripple.toFixed(2) + "deg)";
        if (Math.abs(s.a) > 0.05 || Math.abs(s.v) > 0.05 || live) moving = true;
    });
    if (moving) requestAnimationFrame(windStep); else windRunning = false;
}

// V12b G3 (customer and management, once per load): the first fill of the drink list. A skull of smoke condenses out of fog (2 s), holds, then the fog
// takes it back as card-shaped wisps appear and the cards condense out of them. The cards are in the DOM from the start (screen readers, focus);
// css/style.css hides them until --ghost-wait. A press or key ends the intro at once, and plays the cue from where it would have been.
// Reduced motion: no skull, the cards fade in
function ghostIntro() {
    var list = $("#drink_database"), root = getComputedStyle(document.documentElement), t0 = performance.now();
    var token = function (name) { return parseFloat(root.getPropertyValue(name)); };
    list.addClass("intro");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setTimeout(function () { list.removeClass("intro"); }, token("--lift-out"));

    var form = 2000, blow = token("--ghost-blow"), go = token("--fog-pass"); // ms: condensing, holding ends, going
    $("body").append('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="smoke" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="7" result="warp"><animate attributeName="baseFrequency" dur="8s" values="0.012 0.03;0.017 0.022;0.012 0.03" repeatCount="1"/></feTurbulence>' +
        '<feDisplacementMap id="smoke-disp" in="SourceGraphic" in2="warp" scale="60" xChannelSelector="R" yChannelSelector="G" result="shape"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="3" result="fog"/>' +
        '<feComponentTransfer in="fog" result="reveal"><feFuncA id="smoke-reveal" type="linear" slope="5" intercept="-4"/></feComponentTransfer>' +
        '<feComposite in="shape" in2="reveal" operator="in" result="formed"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="11" result="grain"/>' +
        '<feComponentTransfer in="grain" result="pits"><feFuncA type="linear" slope="6" intercept="-3.2"/></feComponentTransfer>' +
        '<feComposite in="formed" in2="pits" operator="out"/></filter></svg>');
    var fx = $('<div class="intro_fx" aria-hidden="true"><div class="skull"></div></div>').appendTo(list); // appended last, so no card changes its nth-child paper
    list.children(".drink").each(function (i) {
        var n = Math.min(i, 7); // at most 8 stagger
        this.style.setProperty("--i", n);
        if (this.offsetTop >= list[0].clientHeight) return; // wisps only for the cards in view
        $('<div class="wisp"></div>').appendTo(fx)[0].style.cssText = "left:" + this.offsetLeft + "px;top:" + this.offsetTop + "px;width:" + this.offsetWidth + "px;height:" + this.offsetHeight +
            "px;--i:" + n + ";--paper:" + getComputedStyle(this).backgroundImage;
    });

    var smooth = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    var reveal = $("#smoke-reveal"), disp = $("#smoke-disp");
    requestAnimationFrame(function curl(now) { // the fog thickens into bone (never quite solid), then thins out; the edges are ragged while forming, nearly still while held, torn as it goes
        var t = now - t0, made = smooth(t / form), taken = smooth((t - blow) / go);
        reveal.attr("intercept", (-4 + 3.9 * made - 3.9 * taken).toFixed(3));
        disp.attr("scale", (60 - 44 * made + 120 * taken).toFixed(1));
        if (fx.parent().length) requestAnimationFrame(curl);
    });

    function end() { clearTimeout(timer); $(document).off(".ghost"); list.off(".ghost"); fx.remove(); list.removeClass("intro"); } // removing the class also ends the cards' animations
    function skip(e) { // the first press lets the browser play audio, so the cue joins where it would be. Not on the Sound plate: that press may be turning Sound off
        if (!$(e.target).closest("#sound").length) sound("creepy-long", 0.8, (performance.now() - t0) / 1000);
        end();
    }
    var timer = setTimeout(end, blow + go);
    $(document).on("pointerdown.ghost keydown.ghost", skip);
    list.on("focusin.ghost", skip);
}

// V12b G4 (customer and management, every tab switch): a spectral trail. fill() is the tab's own empty-and-print, so the new cards are real and take clicks at once.
// The old cards are lifted into a layer that takes none: leaving cards fade there as ghosts; a card that stays goes pale, throws three echoes up from its old seat
// and glides if it moved; a new card condenses. A wave runs from the top left. Clones only for cards in view and one row more. Reduced motion: the new cards fade
var ECHOES = [[0, 0.45, 1200, 8], [140, 0.3, 1100, 16], [280, 0.18, 1000, 24]]; // delay ms, start opacity, fade ms, rise px
function ghostSwap(fill) {
    var list = $("#drink_database"), box = list[0], cards = list.children(".drink"), was = {}, top = box.scrollTop, tint = "var(--ghost-tint) blur(";
    var ids = function (set) { return set.map(function () { return this.dataset.id; }).get().join(); };
    var near = function (s) { return s.y + s.h > 0 && s.y < box.clientHeight + s.h; }; // y is from the top of the visible area
    var before = ids(cards), still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.children(".swap_fx").remove();
    if (!still) {
        cards.each(function () {
            var s = was[this.dataset.id] = { x: this.offsetLeft, y: this.offsetTop - top, w: this.offsetWidth, h: this.offsetHeight, el: this }, c = getComputedStyle(this);
            if (s.near = near(s)) { s.paper = c.backgroundImage; s.rot = c.rotate; } // the clone sits in another nth-child, so it carries its own paper and tilt
        });
        cards.detach();
    }
    fill();
    var now = list.children(".drink");
    if (ids(now) == before) return; // the same tab again
    sound("creepy-tab", 0.5);
    if (still) return now.css("animation", "card-fade var(--lift-out)");

    var fx = $('<div class="swap_fx" aria-hidden="true" inert></div>').css("height", box.scrollHeight).appendTo(list), top2 = box.scrollTop;
    var ease = getComputedStyle(document.documentElement).getPropertyValue("--toast-ease"), step = Math.min(40, 600 / now.length), n = 0;
    var loose = function (el, s) { // a card loose in the layer, where it was
        $(el).find("[id]").addBack("[id]").removeAttr("id");
        el.style.cssText = "left:" + s.x + "px;top:" + (s.y + top2) + "px;width:" + s.w + "px;height:" + s.h + "px;background-image:" + s.paper + ";rotate:" + s.rot;
        fx.append(el);
        return el;
    };
    now.each(function (i) {
        var s = was[this.dataset.id], at = { x: this.offsetLeft, y: this.offsetTop - top2, h: this.offsetHeight };
        if (!near(at)) return; // out of view: nothing to see
        if (!s || !s.near) { // new, or it was out of view: it condenses
            this.animate([{ offset: 0, opacity: 0, filter: tint + "6px)", translate: "0 6px" }, { offset: 0.6, opacity: 0.85 }], { duration: 800, delay: 360 + 30 * n++, easing: ease, fill: "backwards" });
            return;
        }
        s.kept = true;
        var dx = s.x - at.x, dy = s.y - at.y;
        $.each(ECHOES, function (_, e) { // echoes rise off the old seat, or follow the path when the card moves
            var to = dx || dy ? -dx * e[0] / 1100 + "px " + (-dy * e[0] / 1100 - e[3]) + "px" : "0 " + -e[3] + "px";
            loose(s.el.cloneNode(true), s).animate([{ opacity: e[1], filter: tint + "1px)", translate: "0 0" }, { opacity: 0, filter: tint + "6px)", translate: to }], { duration: e[2], delay: i * step + e[0], easing: "ease-out", fill: "both" });
        });
        this.animate([{ translate: dx + "px " + dy + "px" }, { translate: dx / 2 + "px " + dy / 2 + "px", opacity: 0.45, filter: tint + "2px)", offset: 0.45 }, { translate: "0 0" }],
            { duration: 1100, delay: i * step, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "backwards" });
    });
    $.each(was, function (_, s) { // leaving
        if (!s.kept && s.near) loose(s.el, s).animate([{}, { opacity: 0, filter: tint + "6px)", scale: 0.96, translate: "0 -8px" }], { duration: 700, easing: "ease-in", fill: "forwards" });
    });
    Promise.allSettled(fx[0].getAnimations({ subtree: true }).map(function (a) { return a.finished; })).then(function () { fx.remove(); });
}

// onload, check the users access and load the users name etc for display
$(function () {
    addSprings($("footer .languages_menu .languages"), { max: 6, k: 22, c: 3.5, f: 260, sk: 0.08 }); // G1: the flags in the draught
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
