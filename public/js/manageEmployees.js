function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function createTableEntry(id, name, email) {
    cookie = getCookie("selectedEmployees");
    let idlist = cookie ? JSON.parse(cookie) : [];

    let tableEntry = document.createElement("div");
    tableEntry.id = name+id.toString();
    tableEntry.className = "tableEntry"

    let checkBoxDiv = document.createElement("div");
    checkBoxDiv.className = "checkboxColumn";

    let checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.addEventListener('change', e => {
        selectEmployee(e.target.checked, id);
    })
    if (idlist.includes(id)) {
        checkBox.checked = true;
    }
    checkBoxDiv.appendChild(checkBox);

    let idColumn = document.createElement("p");
    idColumn.id = "idColumn" + id.toString();
    idColumn.className = "idColumn";
    idColumn.textContent = id.toString();



    let nameColumn = document.createElement("p");
    nameColumn.id = "nameColumn" + id.toString();
    nameColumn.className = "nameColumn";
    nameColumn.textContent = name;

    let emailColumn = document.createElement("p");
    emailColumn.id = "emailColumn" + id.toString();
    emailColumn.className = "emailColumn";
    emailColumn.textContent = email;

    let deleteButtonDiv = document.createElement("div");
    deleteButtonDiv.className = "deleteButtonColumn";

    let deleteBttn = document.createElement("button");
    deleteBttn.textContent = "Delete";
    deleteBttn.className = "employeeDeleteButton";
    deleteBttn.addEventListener('click', e => {
        deleteEmployee(id, name, email);
    })
    deleteButtonDiv.appendChild(deleteBttn);

    tableEntry.appendChild(checkBoxDiv);
    tableEntry.appendChild(idColumn);
    tableEntry.appendChild(nameColumn);
    tableEntry.appendChild(emailColumn);
    tableEntry.appendChild(deleteButtonDiv);

    return tableEntry;
}

function addEmployee(event) {
    event.preventDefault();

    let responseTxt = document.getElementById("response");

    let body = {
        email: document.getElementById("emailInput").value,
    };
    fetch("/add-employee", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }).then(res => {
        if (res.status == 200) {
        responseTxt.textContent = "request sent";
        document.getElementById("emailInput").value = "";
        } else {
        responseTxt.textContent = res.statusText;
        }
        setTimeout(function() {
        responseTxt.textContent = "";
        }, 3000);
    });
}

function deleteEmployee(id, name, email) {
    if (!window.confirm("Are you sure you want to delete: " + name + "?")) {
        return;
    }

    cookie = getCookie("selectedEmployees");
    let idlist = cookie ? JSON.parse(cookie) : [];

    if (idlist.includes(id)) {
        idlist.splice(idlist.indexOf(id), 1);
    }

    document.cookie = "selectedEmployees=" + JSON.stringify(idlist) + "; SameSite=Strict";

    fetch("/remove-employee", {
        method: 'POST',
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        email: email
        })
    }).then(res => {
        if (res.status == 200) {
        location.reload();
        return;
        }
        window.alert(res.statusText);
    });
}

function selectEmployee(checked, id) {
    cookie = getCookie("selectedEmployees");
    let idlist = cookie ? JSON.parse(cookie) : [];

    if (idlist.includes(id) && !checked) {
        idlist.splice(idlist.indexOf(id), 1);
    } else if (!idlist.includes(id) && checked) {
        idlist.push(id);
    }

    document.cookie = "selectedEmployees=" + JSON.stringify(idlist) + "; SameSite=Strict";
}

function listEmployees(event) {
    fetch("/get-employees", {
        method: 'get',
        headers: {
        "Content-Type": "application/json"
        }
    }).then(res => {
        if (res.status == 200) {
        return res.json();
        }
        window.alert(res.statusText);
    }).then(json => {
        employeeTable = document.getElementById("employeeTable");
        for (employee of json.employees) {
        if (employee) {
            employeeTable.appendChild(createTableEntry(employee.id, employee.name, employee.email));
        }
        }
    });
}

document.getElementById("addEmployee").addEventListener("submit", addEmployee);
document.addEventListener("DOMContentLoaded", listEmployees);