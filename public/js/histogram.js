function create_chart(data) {
    new Chart(document.getElementById('histogram'), {
        type: 'bar',
        data: {
            labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
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


document.getElementById("graph-week").addEventListener('change', () => {
    console.log(document.getElementById("graph-week").selectedIndex + 1);
});
document.getElementById("graph-year").addEventListener('change', () => {
    console.log(document.getElementById("graph-year").value);
});

fetch("/get-amount-of-entries?from=2024-12-09&to=2024-12-15", {
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
