function main() {
    fetch(window.location.href, {
        method: 'GET',
    })
    .then(response => {
        const darkMode = response.headers.get("config");

        if (darkMode == "dark") { 
            const elements = document.querySelectorAll('*');

            elements.forEach((element) => {
                element.classList.toggle('dark-mode');
            })
        }
    })
    .catch(error => {
        console.error("error fething page:", error);
    })
}

document.addEventListener("DOMContentLoaded", main);