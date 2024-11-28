function calcDate(index) {
    var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    var ofset = date.getDay();
    if (ofset == 0) { // Date gebruikt 0 als zondag
        ofset = 6;
    } else {
        ofset--;
    }

    if (index < ofset) {
        return null;
    }

    date.setDate(date.getDate() + (index - ofset));

    if (date.getMonth() != currentDate.getMonth()) {
        return null;
    }

    return date;
}


function createCalender(month, year) {
    // set header text
    document.getElementById("datetext").textContent = currentDate.toLocaleString('en-us', { month: 'long', year: 'numeric' });

    // set day text
    for (var i = 0; i < 40; i++) {
        var li = document.getElementById(i);
        var date = calcDate(i);

        if (!calcDate(i)) {
            li.textContent = "";
            li.className = "";
            li.removeEventListener('click', dateClick);
            continue;
        }

        li.className = "clickable";

        if (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()) {
            li.classList.add("active");
        }

        li.textContent = date.getDate();
        li.addEventListener('click', dateClick);
    }
}


function dateClick(e) {
    if (selectedIndex) {
        document.getElementById(selectedIndex).classList.remove('clicked');
    }
    e.target.classList.add('clicked');
    selectedIndex = Number(e.target.id);

    selectedDate = calcDate(selectedIndex);
    console.log(selectedDate);
}


// month selectors
document.getElementById("left").addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalender(currentDate.getMonth() + 1, currentDate.getFullYear());
});
document.getElementById("right").addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalender(currentDate.getMonth() + 1, currentDate.getFullYear());
});


const today = new Date();
var currentDate = new Date();
createCalender(currentDate.getMonth() + 1, currentDate.getFullYear());
var selectedIndex = null;
var selectedDate = null;