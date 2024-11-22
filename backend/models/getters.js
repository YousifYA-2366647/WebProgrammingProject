import {db} from "../../db.js";

export function getTimeEntries(title="", start="00-00-0000T00:00", end="12-31-9999T23:59", description="") {
    return db.prepare(`
        SELECT * 
        FROM time_entries
        WHERE title LIKE ? AND start = ? AND end = ? AND description LIKE ?
        `).run(title, start, end, description);
}

export function getUsers() {
    return db.prepare("SELECT * FROM users").all();
}