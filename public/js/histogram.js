const ctx = document.getElementById('histogram');

function test(event) {
    event.preventDefault();

    const week = document.getElementById("graph-week").selectedIndex + 1;
    const year = parseInt(document.getElementById("graph-year").value);
    console.log("week: " + week + ", year: " + year);
}

function create_chart(data) {
    new Chart(ctx, {
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

create_chart([12, 15, 3, 5, 2, 3, 1]);

form = document.getElementById("week-selector");
form.addEventListener('submit', test);