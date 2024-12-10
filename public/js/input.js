function sendInput(event) {
    event.preventDefault();

    error = document.getElementById("error");

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("start", document.getElementById("starttime").value);
    formData.append("end", document.getElementById("endtime").value);
    formData.append("description", document.getElementById("description").value);
    
    const fileArray = document.getElementById("file").files;
    for (let i = 0; i < fileArray.length; i++) {
        formData.append("photos", fileArray[i]);
    }

    fetch("/time-entry", {
        method: "POST",
        body: formData
    })
        .then(res => {
            succes = (res.status == 201);
            return res.json();
        })
        .then(res => {
            if (!succes) {
                error.textContent = res.error;
                return;
            }

            form.reset();

            // Show succesfull in error span
            error.textContent = "Submit succesfull";
            error.style = "color: green; text-align: center";

            // After 3 seconds, hide message
            setTimeout(function () { error.textContent = ""; error.style = ""; }, 3000);
        });


}

form = document.getElementById("form");
form.addEventListener('submit', sendInput);