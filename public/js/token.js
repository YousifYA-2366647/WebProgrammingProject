const token = sessionStorage.getItem("token");

// go to login if not logged in
if(!token) {
    window.location.href = '/login';
}

// remove token on logout
document.getElementById("logout").onclick = function() {sessionStorage.clear()}