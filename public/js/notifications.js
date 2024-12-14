window.onload = function() {
    let acceptButton = document.getElementById("acceptNotification");
    let deleteButton = document.getElementById("deleteNotification");
    let titleButton = document.getElementById("notificationTitle");

    if (acceptButton) {
        acceptButton.addEventListener("click", function() {
            document.removeChild(acceptButton.parentElement.parentElement);
        })
    }

    deleteButton.addEventListener('click', function() {
        document.removeChild(acceptButton.parentElement.parentElement);
    })

    titleButton.addEventListener('click', function() {

    })
}

