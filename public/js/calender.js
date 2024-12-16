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


async function dateClick(e) {
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

    entries = [];
    await getOwnItems(entries, "date=" + toURLdateString(selectedDate));
    let employeeQuery = "from=" + toURLdateString(selectedDate) + "T00:00:00&to=" + toURLdateString(selectedDate) + "T23:59:59";
    await getSelectedEmoloyeesEntries(entries, employeeQuery);

    entries.sort((a, b) => { return a.start_time > b.start_time; }); // sort on start date

    let cookie = getCookie("selectedEmployees");
    let id_list = []
    if (cookie) {
        id_list = JSON.parse(cookie);
    }

    for (entry of entries) {
        let colour = null;
        if (id_list.includes(entry.user_id)) {
            colour = getColour(entry.user_id);
        }
        entryList.appendChild(createLi(entry, colour));
    }
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