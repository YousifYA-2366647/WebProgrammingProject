import { db } from "../../db.js";
import { tokenKey } from "../middleware/authorization.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function insertUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUser = db.prepare("INSERT INTO users (name, email, password, employees, boss) VALUES (?, ?, ?, ?, ?)")
    const result = insertUser.run(username, email, hashedPassword, "", "");
    return result;
};

export function getUsers(username = "%", email = "%") {
    return db.prepare(`
        SELECT * 
        FROM users
        WHERE name LIKE ? AND email LIKE ?`).all(username, email);
};

export function getUserById(userId) {
    return db.prepare(`
        SELECT * 
        FROM users
        WHERE id = ?`).get(userId);
}

export function addEmployeeToAdmin(admin, employeeId) {
    let employees = [];
    if (admin.employees != "") {
        employees = admin.employees.split(",");
    }
    if (employees.indexOf(employeeId.toString()) == -1) {
        employees.push(employeeId.toString());

        const employee = getUserById(employeeId);
        let bosses = employee.boss == "" ? []: employee.boss.split(",");
        bosses.push(admin.id.toString());

        db.prepare("UPDATE users SET employees = ? WHERE id = ?").run(employees.join(","), admin.id);
        db.prepare("UPDATE users SET boss = ? WHERE id = ?").run(bosses.join(","), employeeId);
        return true;
    }
    else {
        return false
    }
}

export function getEmployees(userId) {
    const employees = db.prepare("SELECT employees FROM users WHERE id = ?").get(userId).employees;
    let employeeList = employees.split(",");

    let listOfEmployees = []
    employeeList.forEach((employeeId) => {
        listOfEmployees.push(getUserById(employeeId));
    })

    return listOfEmployees;
}

export function isEmployee(userId, employeeId) {
    const employees = db.prepare("SELECT employees FROM users WHERE id = ?").get(userId).employees;
    return employees.includes(employeeId.toString());
}

export function removeEmployee(userId, employeeId) {
    let employees = db.prepare("SELECT employees FROM users WHERE id = ?").get(userId)['employees'].split(",");
    const index = employees.indexOf(employeeId.toString());
    if (index > -1) {
        employees.splice(index, 1);

        const employee = getUserById(employeeId);
        let bosses = employee.boss.split(",");
        const bossIndex = bosses.indexOf(userId.toString());
        if (bossIndex > -1) {
            bosses.splice(bossIndex, 1);
        }

        db.prepare("UPDATE users SET employees = ? WHERE id = ?").run(employees.join(","), userId);
        db.prepare("UPDATE users SET boss = ? WHERE id = ?").run(bosses.join(","), employeeId);
        return true;
    }
    else {
        return false;
    }
}

export function getBosses(employeeId) {
    const bosses = db.prepare("SELECT boss FROM users WHERE id = ?").get(employeeId).boss;
    let bossList = bosses.split(",");

    let listOfbosses = []
    bossList.forEach((bossId) => {
        listOfbosses.push(getUserById(bossId));
    })

    return listOfbosses;
}

export function getUserFromToken(userToken) {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(jwt.verify(userToken, tokenKey).email)[0];

    return user;
}