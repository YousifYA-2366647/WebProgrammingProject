function saveSettings(event) {
    event.preventDefault();

    let darkModeCheckbox = document.getElementById("darkModeButton");
    let histogramCheckbox = document.getElementById("histogramChoice");

    let usesDarkMode = 0;
    let analyse = "list";
    if (darkModeCheckbox.checked) {
        usesDarkMode = 1;
    }
    if (histogramCheckbox.checked) {
        analyse = "histogram";
    }

    let body = {
        darkMode: usesDarkMode,
        analyseView: analyse
    }

    fetch("/settings", {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })
    .then(response => {
        if (response.status == 201) {
            window.location.href = "/";
            return;
        }
        return response.json();
    })
    .then(response => {
        if (response.status == 400) {
            console.log("error while posting settings");
        }
    })
}

function main() {
    let darkModeCheckbox = document.getElementById("darkModeButton");
    let darkModeLabel = document.getElementById("darkModeLabel");
    let histogramCheckbox = document.getElementById("histogramChoice");
    let listViewCheckbox = document.getElementById("listChoice");

    darkModeCheckbox.checked = histogramCheckbox.checked = listViewCheckbox.checked = false;


    darkModeCheckbox.addEventListener("change", function() {
        const elements = document.querySelectorAll('*');

        elements.forEach((element) => {
            element.classList.toggle('dark-mode');
        })

        if (darkModeCheckbox.checked) {
            darkModeLabel.textContent = "Toggle Light Mode";
        }
        else {
            darkModeLabel.textContent = "Toggle Dark Mode";
        }
    })

    histogramCheckbox.addEventListener("change", function() {
        if (listViewCheckbox.checked) {
            listViewCheckbox.checked = false;
        }
        if (!histogramCheckbox.checked) {
            histogramCheckbox.checked = true;
        }
    });

    listViewCheckbox.addEventListener("change", function() {
        if (histogramCheckbox.checked) {
            histogramCheckbox.checked = false;
        }
        if (!listViewCheckbox.checked)  {
            listViewCheckbox.checked = true;
        }
    });


    let saveButton = document.getElementById("save");
    let cancelButton = document.getElementById("cancel");

    saveButton.addEventListener("click", saveSettings);
    cancelButton.addEventListener("click", function(event) {
        event.preventDefault();
        window.location.href = "/";
    })

    
    fetch(window.location.href, {
        method: 'GET',
    })
    .then(response => {
        const darkMode = response.headers.get("darkMode");

        if (darkMode == "dark") { 
            darkModeCheckbox.checked = true;
            darkModeLabel.textContent = "Toggle Light Mode";
            const elements = document.querySelectorAll('*');

            elements.forEach((element) => {
                element.classList.toggle('dark-mode');
            })
        }

        const analyseView = response.headers.get("analyseView");
        if (analyseView == "list") {
            listViewCheckbox.checked = true;
        }
        else {
            histogramCheckbox.checked = true;
        }
    })
    .catch(error => {
        console.error("error fething page:", error);
    })
}

document.addEventListener("DOMContentLoaded", main);