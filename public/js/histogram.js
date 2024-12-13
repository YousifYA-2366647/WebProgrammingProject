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

create_chart([12, 15, 3, 5, 2, 3, 1]);


document.getElementById("graph-week").addEventListener('change', () => {
    console.log(document.getElementById("graph-week").selectedIndex + 1);
});
document.getElementById("graph-year").addEventListener('change', () => {
    console.log(document.getElementById("graph-year").value);
});
