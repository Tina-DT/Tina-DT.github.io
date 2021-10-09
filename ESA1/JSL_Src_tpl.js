"use strict";

var letztesBild = 1;
var intervallNummern = [];

function intervalFunktion(drehRichtung) {
    letztesBild += drehRichtung;
    if (letztesBild > 7)
        letztesBild = 1;
    if (letztesBild < 1)
        letztesBild = 7;
    var bild = document.getElementById('i');
    bild.setAttribute("src", "bilder/rad" + letztesBild + ".png");
}

window.onkeydown = function(evt) {
    var key = evt.which ? evt.which : evt.keyCode;
    var c = String.fromCharCode(key);
    switch (c) {
        case ('R'):
            intervalFunktion(1);
            break;
        case ('L'):
            intervalFunktion(-1);
            break;
        case ('A'):
            intervallNummern.push(window.setInterval(intervalFunktion, 100, 1));
            break;
        case ('S'):
            while (intervallNummern.length > 0)
                window.clearInterval(intervallNummern.pop());
            break;
    }
}
