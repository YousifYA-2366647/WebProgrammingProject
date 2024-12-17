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
    return db.prepare(`
        INSERT INTO time_entries (user_id, title, start_time, end_time, description, files) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, title, start, end, description, files);
};

export function getAmountOfEntries(userId, start="0000-01-01", end="9999-12-31", title = "%", description = "%") {
    let startDate = new Date(start);
    let endDate = new Date(end);


    var listOfEntries = {}
    while (startDate <= endDate) {
        const dateString = startDate.toISOString().substring(0, 10)

        start = dateString.concat("T00:00:00");
        end = dateString.concat("T23:59:59");

        listOfEntries[dateString] = db.prepare(`
            SELECT COUNT(*)
            FROM time_entries
            WHERE user_id = ?
            AND title LIKE ?
            AND (start_time <= ?) AND (end_time >= ?)
            AND description LIKE ?
            `).get(userId, title, end, start, description)['COUNT(*)'];

        startDate.setDate(startDate.getDate()+1);
    }

    return listOfEntries;
}