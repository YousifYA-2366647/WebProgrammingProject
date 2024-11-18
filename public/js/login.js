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
        .then(res => {
            succes = false;
            if (res.status == 200) {
                succes = true;
            }
            return res.json();
        })
        .then(res => {
            if (!succes) {
                document.getElementById("error").textContent = res.error;
                return;
            }
            localStorage.setItem("token", res.token);
            window.location.pathname = '/';
        });
}

let buttonLogin = document.getElementById("button");
buttonLogin.onclick = login;