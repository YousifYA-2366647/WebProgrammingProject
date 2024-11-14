function login() {
    let body = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    if (!body.email || !body.password) {
        document.getElementById("error").textContent = "Please fill in all fields";
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch("/login", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body)
    })
        .then((response) => {
            if (response.status == 200) {
                // succes
                window.location.pathname = '/';
            }
            console.log(response)
        });
}

let buttonLogin = document.getElementById("button");
buttonLogin.onclick = login;