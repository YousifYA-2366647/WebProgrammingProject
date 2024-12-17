import { db } from "../../db.js";
import { tokenKey } from "../middleware/authorization.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function insertUser(username, email, password, employees) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUser = db.prepare("INSERT INTO users (name, email, password, employees) VALUES (?, ?, ?, ?)")
    const result = insertUser.run(username, email, hashedPassword, employees);
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

        db.prepare("UPDATE users SET employees = ? WHERE id = ?").run(employees.join(","), admin.id);
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
        listOfEmployees.push(db.prepare("SELECT * FROM users WHERE id = ?").all(employeeId)[0]);
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
        db.prepare("UPDATE users SET employees = ? WHERE id = ?").run(employees.join(","), userId);
        return true;
    }
    else {
        return false;
    }
}

export function getUserFromToken(userToken) {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(jwt.verify(userToken, tokenKey).email)[0];

    return user;
}