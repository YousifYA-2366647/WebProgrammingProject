import express from "express";
import jwt from "jsonwebtoken";
import { checkEntryRequest } from "../middleware/formChecking.js";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { insertEntry, getTimeEntries } from "../controllers/timeEntryController.js";

const entryRouter = express.Router();

entryRouter.post("/time-entry", checkEntryRequest(), express.json(), (req, res) => {
    const userId = jwt.verify(getCookies(req).token, tokenKey).userId;
    const title = req.body.title;
    const start = req.body.start;
    const end = req.body.end;
    const description = req.body.description;
    const files = JSON.stringify(req.body.files);

    insertEntry(userId, title, start, end, description, files);

    res.status(201).json({message: "Entry submitted successfully"});
})

entryRouter.get("/analyse", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    const userToken = getCookies(request).token;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(jwt.verify(userToken, tokenKey))[0];
    const entries = getTimeEntries(user.id);

    response.render('pages/analyse');
    response.status(200).json({timeEntries: entries});
});

entryRouter.get("/input", (request, response) => {
    if (!getCookies(request).token) {
    response.redirect("/login");
    return;
    }

    response.render('pages/input');
});

export {entryRouter};