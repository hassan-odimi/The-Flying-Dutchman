/** The Flying Dutchman
 *  multilanguage.js
 *  Created by 'Pirates of the Caribbean' on 09 of February 2018.
 */

/*LANGUAGE SELECTION CONTROL
* Call translate() method on corresponding script page
* This script must be loaded in all pages, along with both the js script and view corresponding to that particular page!
* The indexes and their corresponding languages: [0] English , [1] Swedish, [2] Italian, [3] Spanish, [4] Pirate
*/

var flags = ["eng", "sve", "ita", "esp", "pirate"]; // same order as the text indexes

function setLanguage(index) {
    translate(index); // page-specific texts
    document.documentElement.lang = ["en", "sv", "it", "es", "en"][index]; // Pirate is English
    $(".undo_label").text(undo_label[index]);
    $(".redo_label").text(redo_label[index]);
    $("#remove_word").text(remove_word[index]);
    $(".languages_menu a").removeAttr("aria-current");
    $("#" + flags[index]).attr("aria-current", "true");
}

setLanguage(localStorage.getItem("index") || 0); /* Call with each page load (retrieved save index)*/

$(document).ready(function () { /*Call setLanguage() on menu (flags) selection*/
    $.each(flags, function (index, flag) {
        $("#" + flag).click(function () {
            setLanguage(index);
            localStorage.setItem("index", index); /*Save selected index for the next loaded pages*/
            return false; // stop href="#" jumping to the top
        });
    });
})
