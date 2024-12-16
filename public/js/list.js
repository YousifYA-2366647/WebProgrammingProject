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