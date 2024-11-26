import { db } from "../../db.js";
import bcrypt from "bcrypt";

export async function insertUser(username, email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    const result = insertUser.run(username, email, hashedPassword, role);
    console.log(result);
    return result;
};

export function getUsers(username="%", email="%") {
    return db.prepare(`
        SELECT * 
        FROM users
        WHERE username LIKE ? AND email LIKE ?`).all(username, email);
};