function createAccount() {
    let body = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
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
        .then((response) => {
            if (response.status == 201) {
                // succes
                window.location.pathname = '/login';
            }
            else {
                document.getElementById("error").textContent = "Couldn't create account"
            }
        });
}

let buttonRegister = document.getElementById("button");
button.onclick = createAccount;