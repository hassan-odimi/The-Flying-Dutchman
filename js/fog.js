// V12b G5: a slow bank of mist crosses a page that arrived through a view transition (Chromium; elsewhere pages load plainly).
// Loaded render-blocking in the head: pagereveal fires at the first paint, which can come before the scripts at the end of the body have run
function mistBank() {
    var bank = document.createElement("div");
    bank.className = "mist_bank";
    bank.setAttribute("aria-hidden", "true");
    document.documentElement.append(bank); // the body may not be parsed yet
    return bank;
}
addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;
    var bank = mistBank();
    e.viewTransition.finished.then(function () { bank.remove(); }, function () { bank.remove(); }); // a skipped transition must not leave the bank on the page
});
