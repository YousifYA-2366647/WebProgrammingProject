function getSelectedEmoloyeesEntries() {
    let colours = ["blue", "red", "green", "yellow"];
    let colourIndex = 1;

    let cookie = getCookie("selectedEmployees");
    if (!cookie) {
        return;
    }
    employeeList = JSON.parse(cookie);

    for (id of employeeList) {
        let colour = colours[colourIndex];
        let url = "/get-employee-entries?id=" + id;
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(res => {
            if (res.status == 200) {
                return res.json();
            }
        }).then(json => {
            for (entry of json.employeeEntries) {
                entryList.appendChild(createLi(entry, colour));
            }
        });

        if (++colourIndex > colours.length - 1) {
            colourIndex = 0;
        }
    }
}

function createLi(entry, colour = null) {
    li = document.createElement("li");

    title = document.createElement("t");
    title.textContent = entry.title;
    if (colour) {
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


entryList = document.getElementById("list-entry-list");

fetch("/get-time-entries", {
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

    entries.sort((a, b) => { return a.start_time > b.start_time; }); // sort on start date

    for (i = 0; i < entries.length; i++) {
        entryList.appendChild(createLi(entries[i]));
    }
});



getSelectedEmoloyeesEntries();