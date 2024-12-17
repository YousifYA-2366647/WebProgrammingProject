document.getElementById("exportButton").addEventListener('click', function() {
    fetch("/export-list", {
        method: "GET",
    })
        .then((res) => {
            if (res.status == 500) {
                document.getElementById("exportError").textContent = "Couldn't load pdf.";
                return;
            }
            return res.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'time_entries.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
})