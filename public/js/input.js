function sendInput(event) {
    event.preventDefault();

    error = document.getElementById("error");

    let body = {
        title: document.getElementById("title").value,
        start: document.getElementById("starttime").value,
        end: document.getElementById("endtime").value,
        description: document.getElementById("description").value,
        files: document.getElementById("file").files,
    };

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
                return;
            }

            form.reset();

            // Show succesfull in error span
            error.textContent = "Submit succesfull";
            error.style = "color: green; text-align: center";

            // After 3 seconds, hide message
            setTimeout(function () { error.textContent = ""; error.style = ""; }, 3000);
        });


}

function getCookieValue(cookieName) {
    const cookies = document.cookie.split('; ');

    for (let i = 0; i < cookies.length; i++) {
        const [name, value] = cookies[i].split('=');
        if (name == cookieName) {
            return value;
        }
    }
    return null;
}

function setupSettings() {
    if (getCookieValue('darkMode') == 1) {
        const elements = document.querySelectorAll('*');

        elements.forEach((element) => {
            element.classList.toggle('dark-mode');
        })
    }
}

document.addEventListener("DOMContentLoaded", setupSettings);

form = document.getElementById("form");
form.addEventListener('submit', sendInput);