import { db } from "../../db.js";

export function getUserNotifications(senderId) {
    return db.prepare(`
        SELECT *
        FROM notifications
        WHERE receiver_id = ?
        `).all(senderId);
}

export function addNotification(fromId, toId, entry, title, date) {
    db.prepare(`
        INSERT INTO notifications (sender_id, receiver_id, entry_id, title, preview, date, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(fromId, toId, entry.id, title, entry.title, date, 0);
}

export function readNotification(notificationId) {
    db.prepare(`
        UPDATE notifications
        SET is_read = ?
        WHERE id = ?
        `).run(1, notificationId);
}