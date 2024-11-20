function login() {
    let body = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    if (!body.email || !body.password) {
        document.getElementById("error").textContent = "Please fill in all fields";
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
        .then(res => {
            succes = (res.status == 200);
            return res.json();
        })
        .then(res => {
            if (!succes) {
                document.getElementById("error").textContent = res.error;
                return;
            }
            window.location.href = '/';
        });
}

let buttonLogin = document.getElementById("button");
buttonLogin.onclick = login;