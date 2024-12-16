import express from "express";
import jwt from "jsonwebtoken";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { db } from "../../db.js";
import { getUserSettings, updateUserSettings } from "../controllers/settingsController.js";
import { getUserFromToken } from "../controllers/userController.js";

const settingsRouter = express.Router();

settingsRouter.get("/settings", (request, response) => {
    let token = getCookies(request).token;
    if (!token) {
        response.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;
    response.render('pages/settings', {isAdmin: isAdmin});
});

settingsRouter.post("/settings", (request, response) => {
    const usesDarkmode = request.body.darkMode;
    const analyseView = request.body.analyseView;

    const user = getUserFromToken(getCookies(request).token);

    updateUserSettings(user.id, usesDarkmode, analyseView);

    response.status(200).json();
})

settingsRouter.get("/manage-employees", (req, res) => {
    let token = getCookies(req).token;
    if (!token) {
        res.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;

    if (!isAdmin) {
        res.status(401).json({ error: "Access Denied" });
        return;
    }

    res.render("pages/manage-employees", { isAdmin: true });
});

export { settingsRouter }