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

function removeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.parentNode.removeChild(notification);
    }
}

function acceptNotification(id) {
    let postBody = {
        notificationId: id
    }
    document.getElementById("notificationTitle").style = "color:rgb(158, 141, 209)";

    fetch("/read-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody)
    });
}

function createNotification(notification) {
    let notificationFlare = document.createElement("div");
    notificationFlare.id = notification.id;
    notificationFlare.className = "notificationFlare";
    
    let notificationDetails = document.createElement("div");
    notificationDetails.id = "notificationDetails";

    let actionButtons = document.createElement("div");
    actionButtons.id = "actionButtons";

    let notificationTitle = document.createElement("p");
    notificationTitle.id = "notificationTitle";
    notificationTitle.textContent = notification.title;

    let notificationPreview = document.createElement("p");
    notificationPreview.id = "notificationPreview";
    notificationPreview.textContent = notification.preview;

    let notificationDate = document.createElement("p");
    notificationDate.id = "notificationDate";
    notificationDate.textContent = notification.date;

    let acceptButton = document.createElement("button");
    acceptButton.id = "acceptNotification";
    acceptButton.addEventListener('click', function() {
        acceptNotification(notificationFlare.id)
    });
    acceptButton.textContent = "✓";

    let deleteButton = document.createElement("button");
    deleteButton.id = "deleteNotification";
    deleteButton.addEventListener('click', function() {
        removeNotification(notificationFlare.id)
    });
    deleteButton.textContent = "🗑";
    

    notificationDetails.appendChild(notificationTitle);
    notificationDetails.appendChild(notificationPreview);
    notificationDetails.appendChild(notificationDate);

    actionButtons.appendChild(acceptButton);
    actionButtons.appendChild(deleteButton);

    notificationFlare.appendChild(notificationDetails);
    notificationFlare.appendChild(actionButtons);
    
    if (getCookieValue('darkMode') == 1) {
        const elements = notificationFlare.querySelectorAll('*');

        elements.forEach((element) => {
            element.classList.toggle('dark-mode');
        })

        notificationFlare.classList.toggle('dark-mode');
    }

    return notificationFlare;
}

window.onload = function() {
    fetch("/get-notifications", {
        method: "GET"
    })
        .then((res) => {
            if (res.status !== 200) {
                alert(res.statusText);
                return;
            }
            return res.json();
        })
        .then(res => {
            let notificationScroller = document.getElementById("notificationScroller");
            res.forEach((notification, index) => {
                let notificationNode = createNotification(notification);
                notificationScroller.appendChild(notificationNode);
            });
        })
        .catch((error) => {
            console.error("error fetching or rendering notifications", error);
        })
}
