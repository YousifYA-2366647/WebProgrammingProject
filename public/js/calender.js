function createCalender(month, year) {
    var date = new Date(year, month - 1, 1);

    document.getElementById("datetext").textContent = date.toLocaleString('en-us', { month: 'long', year: 'numeric' });

    var ofset = date.getDay();
    if (ofset == 0) { // Date gebruikt 0 als zondag
        ofset = 6;
    } else {
        ofset--;
    }

    for (var i = 0; i < 40; i++) {
        var li = document.getElementById(i);

        if (i < ofset) {
            li.textContent = "";
            li.className = "";
            continue;
        }

        if (date.getMonth() + 1 == month) {
            if (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()) {
                li.className = "active";
            } else {
                li.className = "clickable";
            }

            li.textContent = date.getDate();

            date.setDate(date.getDate() + 1);
            continue;
        }

        li.textContent = "";
        li.className = "";
    }
}

function leftClickEvent() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalender(currentDate.getMonth() + 1, currentDate.getFullYear());
}

function rightClickEvent() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalender(currentDate.getMonth() + 1, currentDate.getFullYear());
}

document.getElementById("left").onclick = leftClickEvent;
document.getElementById("right").onclick = rightClickEvent;

const today = new Date();
var currentDate = new Date();
createCalender(currentDate.getMonth() + 1, currentDate.getFullYear());