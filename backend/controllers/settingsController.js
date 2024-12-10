import { db } from "../../db.js";

export function getUserSettings(user_id) {
    return db.prepare("SELECT * FROM settings WHERE user_id = ?").all(user_id)[0];
}

export function updateUserSettings(user_id, usesDarkMode, analyseView) {
    console.log(JSON.stringify({darkMode: usesDarkMode, analyse: analyseView, userId: user_id}));
    db.prepare("UPDATE settings SET usesDarkMode = ?, analyseView = ? WHERE user_id = ?").run(usesDarkMode, analyseView, user_id);
}