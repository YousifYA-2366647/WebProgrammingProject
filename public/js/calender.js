LOCALE = 'en-us'

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


function dateClick(e) {
    if (selectedIndex) {
        document.getElementById(selectedIndex).classList.remove('clicked');
    }
    e.target.classList.add('clicked');
    selectedIndex = Number(e.target.id);

    selectedDate = calcDate(selectedIndex);

    document.getElementById("datetextright").textContent = selectedDate.toLocaleString(LOCALE, { day: 'numeric', month: "long" });

    // list items
    entryList = document.getElementById("entry-list");
    entryList.innerHTML = ""; // lijst leegmaken

    fetch("/get-time-entries", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(res => {
        if(res.status != 200){
            alert(res.statusText);
            return;
        }
        return res.json();
    }).then(res => {
        for(i = 0; i < res.length; i++){
            console.log(res[i]);
            li = document.createElement("li");

            title = document.createElement("t");
            title.textContent = res[i].title;
            li.appendChild(title);

            description = document.createElement("p");
            description.textContent = res[i].description;
            li.appendChild(description);

            entryList.appendChild(li);

        }
    });
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