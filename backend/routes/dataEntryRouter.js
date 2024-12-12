import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { checkEntryRequest } from "../middleware/formChecking.js";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { insertEntry, getTimeEntries, getTimeEntryPerDay } from "../controllers/timeEntryController.js";
import { db } from "../../db.js";

const entryRouter = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "public/tmp/uploads/")
    },
    filename: (req, file, callback) => {
        const fileType = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random()*1E9)}${fileType}`;
        callback(null, fileName);
    }
});

const upload = multer({ storage: storage });

entryRouter.post("/time-entry", upload.any(), checkEntryRequest(), express.json(), (req, res) => {
    const userId = jwt.verify(getCookies(req).token, tokenKey).userId;
    const title = req.body.title;
    const start = req.body.start;
    const end = req.body.end;
    const description = req.body.description;
    let files = [];

    for (const file of req.files) {
        console.log(file.mimetype);
        files.push(file.path);
    }
    
    insertEntry(userId, title, start, end, description, JSON.stringify(files));

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
});

entryRouter.get("/get-entries-per-day", (request, response) => {
    const day = request.query.date;

    const userToken = getCookies(request).token;
    const decodedToken = jwt.verify(userToken, tokenKey);
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(decodedToken.email)[0];

    const entries = getTimeEntryPerDay(user.id, day);

    console.log(entries['COUNT(*)']);

    response.status(200).json({amountOfEntries: entries['COUNT(*)']});
})

export {entryRouter};
