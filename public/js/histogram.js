function getWeekdayStringList() {
    var date = new Date("2024-12-09"); // maandag
    var returnList = [];

    for (var i = 0; i < 7; i++) {
        returnList.push(date.toLocaleString(LOCALE, { weekday: 'long' }));
        date.setDate(date.getDate() + 1);
    }

    return returnList;
}

function create_chart(data) {
    new Chart(document.getElementById('histogram'), {
        type: 'bar',
        data: {
            labels: getWeekdayStringList(),
            datasets: [{
                label: '# of Entries',
                data: data,
                borderWidth: 1
            }]
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

function updateChart(data) {
    var chart = Chart.getChart(document.getElementById('histogram'))
    chart.data.datasets[0].data = data;
    chart.update();
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
    }

    return dateList;
}

// week selector
document.getElementById("graph-week").addEventListener('change', () => {
    var begin = dateList[document.getElementById("graph-week").selectedIndex][0].toISOString().substring(0, 10);
    var end = dateList[document.getElementById("graph-week").selectedIndex][1].toISOString().substring(0, 10);

    const url = "get-entries-per-day?from="+begin + "&to=" + end;
    console.log(url);


    fetch(url, {
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
        updateChart(list);
    });
});

// maand selector
document.getElementById("graph-year").addEventListener('change', () => {
    //geselecteerde week behouden
    var index = document.getElementById("graph-week").selectedIndex;

    dateList = creatWeekOptions(document.getElementById("graph-year").value);

    document.getElementById("graph-week").selectedIndex = index;
    document.getElementById("graph-week").dispatchEvent(new Event("change"));
});

fetch("/get-entries-per-day?from=2024-12-09&to=2024-12-15", {
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
    create_chart(list);
});

var dateList = creatWeekOptions(document.getElementById("graph-year").value);