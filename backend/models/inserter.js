import {db} from "../../db.js";
import bcrypt from "bcrypt";

export async function insertUser(username, email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    const result = insertUser.run(username, email, hashedPassword, role);
    console.log(result);
    return result;
}

export function insertEntry(userId, title, start, end, description, files) {
    const insertEntry = db.prepare(`
        INSERT INTO time_entries (user_id, title, start_time, end_time, description, files) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = insertEntry.run(userId, title, start, end, description, files);
}