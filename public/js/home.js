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

function main() {
    if (getCookieValue('darkMode') == 1) {
        const elements = document.querySelectorAll('*');

        elements.forEach((element) => {
            element.classList.toggle('dark-mode');
        })
    }
}

document.addEventListener("DOMContentLoaded", main);