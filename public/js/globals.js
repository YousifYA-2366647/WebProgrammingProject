const LOCALE = 'nl-be'

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

var colourPerId = {};

function getColour(id) {
    if (colourPerId[id]) {
        return colourPerId[id];
    }

    let colours = ["blue", "red", "green", "yellow"];
    let i = Object.keys(colourPerId).length;
    while (i >= colours.length) {
        i -= colours.length;
    }
    colourPerId[id] = colours[i];

    return colourPerId[id];
}