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
    // set header text
    document.getElementById("datetextleft").textContent = currentDate.toLocaleString(LOCALE, { month: 'long', year: 'numeric' });

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

            time = document.createElement("p");
            time.textContent = entries[i].start_time.substring(11) + ' - '+ entries[i].end_time.substring(11);
            li.appendChild(time);

            description = document.createElement("p");
            description.textContent = entries[i].description;
            li.appendChild(description);

            entryList.appendChild(li);
        }
    });
}


// month selectors
document.getElementById("left").addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalender();
});
document.getElementById("right").addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalender();
});

const today = new Date();
var currentDate = new Date();
createCalender();
var selectedIndex = null;
var selectedDate = null;