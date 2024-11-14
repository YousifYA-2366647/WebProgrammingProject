function createAccount() {

    let body = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch("/register", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body)
    })
    .then((response)=>{
        console.log(response)
    });
}

let buttonRegister = document.getElementById("button");
button.onclick = createAccount;