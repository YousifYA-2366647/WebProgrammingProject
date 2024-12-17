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

    if (JSON.parse(entry.files).length > 0) {
        let downloadLink = document.createElement("a");
        downloadLink.textContent = "Files";
        downloadLink.download = "picture.jpg";
        let url = "/download-files?id=" + entry.id;
        downloadLink.setAttribute('href', url);
        li.appendChild(downloadLink);
    }


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


async function getSelectedEmployeesEntries(list, query = "") {
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

function showCalender(visible) {
    calender = document.getElementById("calender");
    container = document.getElementById("container");

    if (visible) {
        calender.style.display = 'grid';
    }
    else {
        calender.style.display = 'none';
    }
}

function showList(visible) {
    list = document.getElementById("list");
    if (visible) {
        list.style.display = 'grid';
    }
    else {
        list.style.display = 'none';
    }
}

function showGraph(visible) {
    graph = document.getElementById("graph");
    if (visible) {
        graph.style.display = 'grid';
    }
    else {
        graph.style.display = 'none';
    }
}


function selectorFunction(e) {
    let selector = document.getElementById("options");
    switch (selector.selectedIndex) {
        case 0: // List
            showCalender(false);
            showList(true);
            showGraph(false);
            break;
        case 1: // Calender
            showCalender(true);
            showList(false);
            showGraph(false);
            break;
        case 2: // Graph
            showCalender(false);
            showList(false);
            showGraph(true);
            break;
    }
}


document.getElementById("options").addEventListener("change", selectorFunction);
document.addEventListener("DOMContentLoaded", e => {
    let cookie = getCookie("analyseView");
    let selector = document.getElementById("options");

    switch (cookie) {
        case "list":
            selector.selectedIndex = 0;
            break;
        case "calender":
            selector.selectedIndex = 1;
            break;
        case "histogram":
            selector.selectedIndex = 2;
            break;
    }

    selectorFunction(null);
});