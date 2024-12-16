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


function createLi(entry, colour = null) {
    li = document.createElement("li");

    title = document.createElement("t");
    title.textContent = entry.title;
    if (colour) {
        title.textContent += " (" + entry.user_id + ")";
        title.style = "color:" + colour;
    }
    li.appendChild(title);

    startDate = new Date(entry.start_time);
    endDate = new Date(entry.end_time);

    date = document.createElement("p");
    dateOptions = { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    beginText = startDate.toLocaleDateString(LOCALE, dateOptions);
    endText = endDate.toLocaleDateString(LOCALE, dateOptions);
    date.textContent = beginText + ' - ' + endText;
    li.appendChild(date);

    description = document.createElement("p");
    description.textContent = entry.description;
    li.appendChild(description);
    return li;
}


async function getOwnItems(list, query = "") {
    await fetch("/get-time-entries?" + query, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(res => {
        if (res.status != 200) {
            alert(res.statusText);
            return;
        }
        return res.json();
    }).then(res => {
        for (entry of res.timeEntries) {
            list.push(entry);
        }
    });
}


async function getSelectedEmoloyeesEntries(list, query = "") {
    let cookie = getCookie("selectedEmployees");
    if (!cookie) {
        return;
    }

    employeeList = JSON.parse(cookie);
    for (id of employeeList) {
        let url = "/get-employee-entries?id=" + id + "&" + query;
        await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            for (entry of json.employeeEntries) {
                list.push(entry);
            }
        });
    }
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