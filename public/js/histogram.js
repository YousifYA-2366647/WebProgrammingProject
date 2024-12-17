function getWeekdayStringList() {
    var date = new Date("2024-12-09"); // maandag
    var returnList = [];

    for (var i = 0; i < 7; i++) {
        returnList.push(date.toLocaleString(LOCALE, { weekday: 'long' }));
        date.setDate(date.getDate() + 1);
    }

    return returnList;
}

function create_chart() {
    return chart = new Chart(document.getElementById('histogram'), {
        type: 'bar',
        data: {
            labels: getWeekdayStringList(),
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function addDataToChart(label, data) {
    let newDataSet = {
        label: label,
        borderWidth: 1,
        data: data
    }
    chart.data.datasets.push(newDataSet);
    chart.update();
}


async function addOwnAmount() {
    const begin = dateList[document.getElementById("graph-week").selectedIndex][0].toISOString().substring(0, 10);
    const end = dateList[document.getElementById("graph-week").selectedIndex][1].toISOString().substring(0, 10);
    const url = "get-amount-of-entries?from=" + begin + "&to=" + end;

    await fetch(url, {
        method: 'get',
        headers: { "Content-Type": "application/json" }
    }).then(res => {
        if (res.status != 200) {
            alert(res.statusText);
            return;
        }
        return res.json();
    }).then(res => {
        list = [];
        for (i in res) {
            list.push(res[i]);
        }

    });
    addDataToChart("# of entries", list);
}


async function addEmployeeAmount(id) {
    const begin = dateList[document.getElementById("graph-week").selectedIndex][0].toISOString().substring(0, 10);
    const end = dateList[document.getElementById("graph-week").selectedIndex][1].toISOString().substring(0, 10);
    const url = "get-amount-employee-entries?id="+id+"&from=" + begin + "&to=" + end;

    await fetch(url, {
        method: 'get',
        headers: { "Content-Type": "application/json" }
    }).then(res => {
        if (res.status != 200) {
            alert(res.statusText);
            return;
        }
        return res.json();
    }).then(res => {
        list = [];
        for (i in res) {
            list.push(res[i]);
        }
    });
    addDataToChart(id, list);
}

async function updateChart(data) {
    chart.data.datasets = []; // clear graph

    await addOwnAmount();

    let cookie = getCookie("selectedEmployees");
    if (!cookie) {
        return;
    }

    let id_list = JSON.parse(cookie);
    for (id of id_list) {
        await addEmployeeAmount(id);
    }
}

function creatWeekOptions(year) {
    var dateList = []

    var d = new Date(year + "-01-01");
    options = { day: 'numeric', month: 'numeric' };
    // eerste maandag van het jaar zoeken
    if (d.getDay() == 0) {
        d.setDate(d.getDate() - 6)
    } else {
        d.setDate(d.getDate() - d.getDay() + 1)
    }

    var select = document.getElementById('graph-week');
    select.innerHTML = "";

    while (d.getFullYear() <= year) {
        var week = [];

        week.push(new Date(d));
        const maandag = d.toLocaleString(LOCALE, options);
        d.setDate(d.getDate() + 6);

        week.push(new Date(d));
        const zondag = d.toLocaleString(LOCALE, options);
        d.setDate(d.getDate() + 1);

        var option = document.createElement("option");
        option.text = maandag + ' - ' + zondag;
        select.add(option);
        dateList.push(week);

        const today = new Date();
        if (week[0] < today && today < week[1]) {
            document.getElementById("graph-week").selectedIndex = dateList.length - 1;
        }
    }

    return dateList;
}


// week selector
document.getElementById("graph-week").addEventListener('change', () => {
    updateChart();
});


// maand selector
document.getElementById("graph-year").addEventListener('change', () => {
    //geselecteerde week behouden
    var index = document.getElementById("graph-week").selectedIndex;

    dateList = creatWeekOptions(document.getElementById("graph-year").value);

    document.getElementById("graph-week").selectedIndex = index;
    document.getElementById("graph-week").dispatchEvent(new Event("change"));
});

document.getElementById("graph-year").value = (new Date()).getFullYear();

var chart = create_chart();
var dateList = creatWeekOptions(document.getElementById("graph-year").value);
document.getElementById("graph-week").dispatchEvent(new Event("change"));