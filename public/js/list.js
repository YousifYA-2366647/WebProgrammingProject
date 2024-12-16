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


async function getSelectedEmoloyeesEntries(list) {
    let cookie = getCookie("selectedEmployees");
    if (!cookie) {
        return;
    }

    employeeList = JSON.parse(cookie);
    for (id of employeeList) {
        let url = "/get-employee-entries?id=" + id;
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


async function getOwnItems(list) {
    await fetch("/get-time-entries", {
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


async function createList(event) {
    var entryList = document.getElementById("list-entry-list");
    var entries = [];
    await getSelectedEmoloyeesEntries(entries);
    await getOwnItems(entries);

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


document.addEventListener("DOMContentLoaded", createList);