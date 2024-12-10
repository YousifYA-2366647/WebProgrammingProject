import {db} from "../../db.js";

export function getTimeEntries(userId, title="%", start="0000-01-01 00:00:00", end="9999-12-31 23:59:59", description="%") {
    return db.prepare(`
        SELECT * 
        FROM time_entries
        WHERE user_id = ? AND title LIKE ? AND start_time >= ? AND end_time <= ? AND description LIKE ?
        `).all(userId, title, start, end, description);
};

export function insertEntry(userId, title, start, end, description, files) {
    const insertEntry = db.prepare(`
        INSERT INTO time_entries (user_id, title, start_time, end_time, description, files) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, title, start, end, description, files);
};