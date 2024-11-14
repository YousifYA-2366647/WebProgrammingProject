function login(){
    let body = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch("/login", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body)
    })
    .then((response)=>{
        console.log(response)
    });
}

let buttonLogin = document.getElementById("button");
buttonLogin.onclick = login;