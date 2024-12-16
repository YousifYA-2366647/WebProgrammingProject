function createAccount(event) {
    event.preventDefault();

    let body = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        isAdmin: (document.getElementById("userButton").disabled?0: 1)
    };

    if (!body.username || !body.email || !body.password) {
        document.getElementById("error").textContent = "Please fill in all fields";
        return;
    }

    if (body.password != document.getElementById("confirm-password").value) {
        document.getElementById("error").textContent = "Passwords do not match";
        return
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch("/register", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.status == 201) {
                window.location.href = '/login';
                return;
            }
            return response.json();

        })
        .then(res => {
            if (res) {
                document.getElementById("error").textContent = res.error;
            }
        });
}

window.onload = function() {
    let form = document.getElementById("form");
    form.addEventListener('submit', createAccount);

    let adminButton = document.getElementById("adminButton");
    let userButton = document.getElementById("userButton");

    adminButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (userButton.disabled == true) {
            userButton.disabled = false;
        }
        adminButton.disabled = true;
    });

    userButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (adminButton.disabled == true) {
            adminButton.disabled = false;
        }
        userButton.disabled = true;
    })
}