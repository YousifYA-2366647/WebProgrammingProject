import {db} from "../../db.js";

export function getTimeEntries(title="%", start="00-00-0000T00:00", end="12-31-9999T23:59", description="%") {
    return db.prepare(`
        SELECT * 
        FROM time_entries
        WHERE title LIKE ? AND start_time >= ? AND end_time <= ? AND description LIKE ?
        `).all(title, start, end, description);
};

export function insertEntry(userId, title, start, end, description, files) {
    const insertEntry = db.prepare(`
        INSERT INTO time_entries (user_id, title, start_time, end_time, description, files) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = insertEntry.run(userId, title, start, end, description, files);
};