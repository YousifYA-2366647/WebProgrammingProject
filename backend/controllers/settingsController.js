import { db } from "../../db.js";

export function getUserSettings(user_id) {
    return db.prepare("SELECT * FROM settings WHERE user_id = ?").all(user_id)[0];
}

export function updateUserSettings(user_id, usesDarkMode, analyseView) {
    db.prepare("UPDATE settings SET usesDarkMode = ?, analyseView = ? WHERE user_id = ?").run(usesDarkMode, analyseView, user_id);
}

export function insertSettings(user_id, usesDarkMode, analyseView, isAdmin) {
    db.prepare("INSERT INTO settings (user_id, usesDarkMode, analyseView, isAdmin) VALUES (?, ?, ?, ?)").run(user_id, usesDarkMode, analyseView, isAdmin);
}