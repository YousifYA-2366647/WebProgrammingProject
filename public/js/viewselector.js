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

selector = document.getElementById("options");
selector.addEventListener("change", selectorFunction);
selectorFunction(null); // beginpositie