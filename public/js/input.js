function sendInput(event) {
    event.preventDefault();

    error = document.getElementById("error");

    let body = {
        title: document.getElementById("title").value,
        start: document.getElementById("starttime").value,
        end: document.getElementById("endtime").value,
        description: document.getElementById("description").value
    };

    if (!body.title || !body.start || !body.end) {
        error.textContent = "Please fill in all required fields"
        return;
    }

    fetch("/time-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
        .then(res => {
            succes = (res.status == 201);
            return res.json();
        })
        .then(res => {
            if (!succes) {
                error.textContent = res.error;
            }
        });
}

form = document.getElementById("form");
form.addEventListener('submit', sendInput);