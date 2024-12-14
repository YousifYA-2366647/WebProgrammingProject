import { db } from "../../db.js";
import { tokenKey } from "../middleware/authorization.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function insertUser(username, email, password, role, employees) {
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const insertUser = db.prepare("INSERT INTO users (name, email, password, role, employees) VALUES (?, ?, ?, ?, ?)")
    const result = insertUser.run(username, email, hashedPassword, role, employees);

    db.prepare("INSERT INTO settings (user_id, usesDarkMode, analyseView) VALUES (?, ?, ?)").run(result.lastInsertRowid, 0, "list");
    return result;
};

export function getUsers(username="%", email="%") {
    return db.prepare(`
        SELECT * 
        FROM users
        WHERE username LIKE ? AND email LIKE ?`).all(username, email);
};

export function addEmployeeToAdmin(requestToken, employeeId) {
    const admin = db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
        `).run(jwt.verify(requestToken, tokenKey).email);

    let employees = admin.employees;
    if (employees == "") {
        employees += employeeId.toString();
    }
    else {
        employees += "," + employeeId.toString();
    }

    db.prepare("UPDATE users SET employees = ? WHERE user_id = ?").run(employees, admin.id);
}

export function getUserFromToken(userToken) {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(jwt.verify(userToken, tokenKey).email)[0];

    return user;
}