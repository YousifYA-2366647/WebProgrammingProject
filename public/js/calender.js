const LOCALE = 'nl-be'

function calcDate(index) {
    var date = new Date(currentDate.getFullYear(), currentDate.getMonth());

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


function createCalender() {
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

function toURLdateString(date) {
    s = selectedDate.getFullYear() + '-' + (selectedDate.getMonth() + 1) + '-';
    if (date.getDate().toString().length == 1) {
        s += '0';
    }
    return s + date.getDate();
}


function dateClick(e) {
    if (selectedIndex) {
        document.getElementById(selectedIndex).classList.remove('clicked');
    }
    e.target.classList.add('clicked');
    selectedIndex = Number(e.target.id);

    selectedDate = calcDate(selectedIndex);

    document.getElementById("datetextright").textContent = selectedDate.toLocaleString(LOCALE, { day: 'numeric', month: "long" });

    // list items
    entryList = document.getElementById("calender-entry-list");
    entryList.innerHTML = ""; // lijst leegmaken

    url = "/get-time-entries?date=" + toURLdateString(selectedDate);

    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(res => {
        if (res.status != 200) {
            alert(res.statusText);
            return;
        }
        return res.json();
    }).then(res => {
        let entries = res.timeEntries;

        for (i = 0; i < entries.length; i++) {
            li = document.createElement("li");

            title = document.createElement("t");
            title.textContent = entries[i].title;
            li.appendChild(title);

            date = document.createElement("p");
            dateOptions = { day: 'numeric', month: 'numeric', hour: '2-digit', minute:'2-digit'};
            beginText = (new Date(entries[i].start_time)).toLocaleString(LOCALE, dateOptions);
            endText = (new Date(entries[i].end_time)).toLocaleString(LOCALE, dateOptions);
            date.textContent = beginText;
            if (beginText != endText) {
                // twee datums als begin en eind datum anders zijn
                date.textContent += ' - ' + endText;
            }
            li.appendChild(date);

            description = document.createElement("p");
            description.textContent = entries[i].description;
            li.appendChild(description);

            entryList.appendChild(li);
        }
    });
}



const today = new Date();
var currentDate = new Date();

const yearSelector = document.getElementById("calender-year");
const monthSelector = document.getElementById("calender-month");
yearSelector.value = currentDate.getFullYear();
monthSelector.selectedIndex = currentDate.getMonth();
createCalender();

// vars om geselecteerde dag op de kalender bij te houden
var selectedIndex = null;
var selectedDate = null;


monthSelector.addEventListener('change', () => {
    currentDate.setMonth(monthSelector.selectedIndex);
    createCalender();
});
yearSelector.addEventListener('change', () => {
    currentDate.setFullYear(yearSelector.value);
    createCalender();
});