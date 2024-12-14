import { db } from "../../db.js";

export function getUserNotifications(userId) {
    return db.prepare(`
        SELECT *
        FROM notifications
        WHERE user_id = ?
        `).all(userId);
}

export function addNotification(fromId, toId, entry, title, date) {
    db.prepare(`
        INSERT INTO notifications (user_id, receiver_id, entry_id, title, preview, date)
        VALUES (?, ?, ?, ?, ?, ?)
        `).run(fromId, toId, entry.id, title, entry.title, date);
}