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
    let optionSelector = document.getElementById("settings-options");

    let usesDarkMode = 0;
    if (darkModeCheckbox.checked) {
        usesDarkMode = 1;
    }

    let analyse = optionSelector.value.toLowerCase();

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
    let optionSelector = document.getElementById("settings-options");

    if (getCookieValue('darkMode') == 1) {
        darkModeCheckbox.checked = true;
        darkModeLabel.textContent = "Toggle Light Mode";
    }
    switch (getCookieValue('analyseView')) {
        case "list":
            optionSelector.selectedIndex = 0;
            break;
        case "calender":
            optionSelector.selectedIndex = 1;
            break;
        case "histogram":
            optionSelector.selectedIndex = 2;
            break;
    }
}

function main() {
    let darkModeCheckbox = document.getElementById("darkModeButton");
    let darkModeLabel = document.getElementById("darkModeLabel");

    darkModeCheckbox.checked = false;

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
    });

    let saveButton = document.getElementById("save");
    let cancelButton = document.getElementById("cancel");

    saveButton.addEventListener("click", saveSettings);
    cancelButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", main);