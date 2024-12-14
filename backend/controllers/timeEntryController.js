import { db } from "../../db.js";

export function getTimeEntries(userId, title = "%", start = "0000-01-01 00:00:00", end = "9999-12-31 23:59:59", description = "%") {
    return db.prepare(`
        SELECT * 
        FROM time_entries
        WHERE user_id = ? 
        AND title LIKE ? 

        AND (start_time <= ?) AND (end_time >= ?)

        AND description LIKE ?
        `).all(userId, title, end, start, description);
};

export function insertEntry(userId, title, start, end, description, files) {
    const insertEntry = db.prepare(`
        INSERT INTO time_entries (user_id, title, start_time, end_time, description, files) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, title, start, end, description, files);
};

export function getTimeEntryPerDay(userId, date, title = "%", description = "%") {
    const start = date.concat("T00:00:00");
    const end = date.concat("T23:59:59");

    return db.prepare(`
        SELECT COUNT(*)
        FROM time_entries
        WHERE user_id = ?
        AND title LIKE ?
        AND (start_time <= ?) AND (end_time >= ?)
        AND description LIKE ?
        `).get(userId, title, end, start, description);
}