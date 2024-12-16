import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { checkEntryRequest } from "../middleware/formChecking.js";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { insertEntry, getTimeEntries, getAmountOfEntries } from "../controllers/timeEntryController.js";
import { db } from "../../db.js";
import { getUserFromToken, getUsers } from "../controllers/userController.js";

const entryRouter = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "public/tmp/uploads/")
    },
    filename: (req, file, callback) => {
        const fileType = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileType}`;
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

        const user = getUserFromToken(getCookies(request).token);

        let entries = JSON.stringify("");
        if (!date) {
            entries = getTimeEntries(user.id);
        }
        else {
            entries = getTimeEntries(user.id, "%", date.concat("T00:00:00"), date.concat("T23:59:59"), "%");
        }

        console.log(entries);
        response.status(200).json({ timeEntries: entries });
    } catch (err) {
        response.status(401).json({ error: err });
    }
});

entryRouter.get("/get-amount-of-entries", (request, response) => {
    const start = request.query.from;
    const end = request.query.to;

    const user = getUserFromToken(getCookies(request).token);

    const entries = getAmountOfEntries(user.id, start, end);

    response.status(200).json(entries);
})

entryRouter.get("/get-employee-entries", (request, response) => {
    const employeeId = getUsers("%", request.body.email).id;
    const start = request.body.start;
    const end = request.body.end;

    try {
        const employeeEntries = getTimeEntries(employeeId, "%", start, end, "%");

        response.status(200).json(employeeEntries);
    }
    catch (err) {
        response.status(400).json({error: err});
    }
})

export { entryRouter };
