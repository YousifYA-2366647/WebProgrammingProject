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

    const settingsBody = {
        darkMode: usesDarkMode,
        analyseView: analyse
    };

    fetch("/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsBody)
    }).then(res => {
        if (res.status == 200) {
            document.cookie = `darkMode=${usesDarkMode}; path=/; max-age=31536000`;
            document.cookie = `analyseView=${analyse}; path=/; max-age=31536000`;
        }

        window.location.href = "/";
    })
}

function setupSettings() {
    let darkModeCheckbox = document.getElementById("darkModeButton");
    let darkModeLabel = document.getElementById("darkModeLabel");
    let histogramCheckbox = document.getElementById("histogramChoice");
    let listViewCheckbox = document.getElementById("listChoice");

    if (getCookieValue('darkMode') == 1) {
        darkModeCheckbox.checked = true;
        darkModeLabel.textContent = "Toggle Light Mode";
    }
    if (getCookieValue('analyseView') == "list") {
        listViewCheckbox.checked = true;
    }
    else if (getCookieValue('analyseView') == "histogram") {
        histogramCheckbox.checked = true;
    }
}

function addEmployee(event) {
    event.preventDefault();

    let responseTxt = document.getElementById("response");

    let body = { email: document.getElementById("emailInput").value, };
    fetch("/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    }).then(res => {
        if (res.status == 200) {
            responseTxt.textContent = "request sent";
            return null;
        } else {
            return res.json();
        }
    }).then(res => {
        if (res != null) {
            responseTxt.textContent = res.error;
        }
        setTimeout(function () {
            responseTxt.textContent = "";
        }, 3000);
    })
}

function main() {
    let darkModeCheckbox = document.getElementById("darkModeButton");
    let darkModeLabel = document.getElementById("darkModeLabel");
    let histogramCheckbox = document.getElementById("histogramChoice");
    let listViewCheckbox = document.getElementById("listChoice");

    darkModeCheckbox.checked = histogramCheckbox.checked = listViewCheckbox.checked = false;

    setupSettings();

    darkModeCheckbox.addEventListener("change", function () {
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

    histogramCheckbox.addEventListener("change", function () {
        if (listViewCheckbox.checked) {
            listViewCheckbox.checked = false;
        }
        if (!histogramCheckbox.checked) {
            histogramCheckbox.checked = true;
        }
    });

    listViewCheckbox.addEventListener("change", function () {
        if (histogramCheckbox.checked) {
            histogramCheckbox.checked = false;
        }
        if (!listViewCheckbox.checked) {
            listViewCheckbox.checked = true;
        }
    });

    let requestForm = document.getElementById("addEmployee");
    requestForm.addEventListener("submit", addEmployee);

    let saveButton = document.getElementById("save");
    let cancelButton = document.getElementById("cancel");

    saveButton.addEventListener("click", saveSettings);
    cancelButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "/";
    })
}

document.addEventListener("DOMContentLoaded", main);