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
        li = document.createElement("li");

        title = document.createElement("t");
        title.textContent = entries[i].title;
        li.appendChild(title);

        startDate = new Date(entries[i].start_time);
        endDate = new Date(entries[i].end_time);

        date = document.createElement("p");
        dateOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };
        date.textContent = startDate.toLocaleDateString(LOCALE, dateOptions);
        li.appendChild(date);

        time = document.createElement("p");
        timeOptions = { hour: 'numeric', minute: 'numeric' }
        time.textContent = startDate.toLocaleTimeString(LOCALE, timeOptions) + ' - ' + endDate.toLocaleTimeString(LOCALE, timeOptions);
        li.appendChild(time);

        description = document.createElement("p");
        description.textContent = entries[i].description;
        li.appendChild(description);

        entryList.appendChild(li);
    }
});