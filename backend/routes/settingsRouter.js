import express from "express";
import jwt from "jsonwebtoken";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { db } from "../../db.js";
import { updateUserSettings } from "../controllers/settingsController.js";
import { getUserFromToken } from "../controllers/userController.js";

const settingsRouter = express.Router();

settingsRouter.get("/settings", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render('pages/settings', {isAdmin: true});
});

settingsRouter.post("/settings", (request, response) => {
    const usesDarkmode = request.body.darkMode;
    const analyseView = request.body.analyseView;

    const user = getUserFromToken(getCookies(request).token);

    updateUserSettings(user.id, usesDarkmode, analyseView);

    response.status(200).json();
})

export {settingsRouter}