import { db } from "../../db.js";

export function getUserNotifications(senderId) {
    return db.prepare(`
        SELECT *
        FROM notifications
        WHERE receiver_id = ?
        `).all(senderId);
}

export function addNotification(fromId, toId, entry, title, date) {
    let preview = ""
    let entryId = null
    if (entry != null) {
        preview = entry.title;
        entryId = entry.id
    }

    db.prepare(`
        INSERT INTO notifications (sender_id, receiver_id, entry_id, title, preview, date, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(fromId, toId, entryId, title, preview, date, 0);
}

export function readNotification(notificationId) {
    db.prepare(`
        UPDATE notifications
        SET is_read = ?
        WHERE id = ?
        `).run(1, notificationId);
}

export function getReceiver(notificationId) {
    return db.prepare(`
        SELECT receiver_id
        FROM notifications
        WHERE id = ?
        `).get(notificationId)['receiver_id'];
}

export function getSender(notificationId) {
    return db.prepare(`
        SELECT sender_id
        FROM notifications
        WHERE id = ?
        `).get(notificationId)['sender_id'];
}

export function removeNotification(notificationId) {
    db.prepare(`
        DELETE FROM notifications
        WHERE id = ?
        `).run(notificationId);
}