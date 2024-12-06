import express from "express";
import jwt from "jsonwebtoken";
import { checkEntryRequest } from "../middleware/formChecking.js";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { insertEntry, getTimeEntries } from "../controllers/timeEntryController.js";
import { db } from "../../db.js";

const entryRouter = express.Router();

entryRouter.post("/time-entry", checkEntryRequest(), express.json(), (req, res) => {
    const userId = jwt.verify(getCookies(req).token, tokenKey).userId;
    const title = req.body.title;
    const start = req.body.start;
    const end = req.body.end;
    const description = req.body.description;
    const files = JSON.stringify(req.body.files);

    insertEntry(userId, title, start, end, description, files);

    res.status(201).json({ message: "Entry submitted successfully" });
})

entryRouter.get("/analyse", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render('pages/analyse');
});

entryRouter.get("/input", (request, response) => {
    if (!getCookies(request).token) {
    response.redirect("/login");
    return;
    }

    response.render('pages/input');
});

entryRouter.get("/get-time-entries", (request, response) => {
    try {
        let date = request.query.date;
        console.log(date);

        const userToken = getCookies(request).token;
        const decodedToken = jwt.verify(userToken, tokenKey);
        const user = db.prepare("SELECT * FROM users WHERE email = ?").all(decodedToken.email)[0];

        let entries = JSON.stringify("");
        if (!date) {
            entries = getTimeEntries(user.id);
        }
        else {
            entries = getTimeEntries(user.id, "%", date.concat("T00:00:00"), date.concat("T23:59:59"), "%");
        }

        console.log(entries);
        response.status(200).json({timeEntries: entries});
    } catch (err) {
        response.status(401).json({error: err});
    }
})

export {entryRouter};
