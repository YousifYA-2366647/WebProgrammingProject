import express from "express";
import jwt from "jsonwebtoken";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { db } from "../../db.js";
import { updateUserSettings } from "../controllers/settingsController.js";

const settingsRouter = express.Router();

settingsRouter.get("/settings", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render('pages/settings');
});

settingsRouter.post("/settings", (request, response) => {
    const usesDarkmode = request.body.darkMode;
    const analyseView = request.body.analyseView;

    const userToken = getCookies(request).token;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(jwt.verify(userToken, tokenKey).email)[0];

    updateUserSettings(user.id, usesDarkmode, analyseView);

    response.status(200);
})

export {settingsRouter}