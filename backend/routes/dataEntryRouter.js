import express, { query } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import PDFDocument from "pdfkit";
import { checkEntryRequest } from "../middleware/formChecking.js";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { insertEntry, getTimeEntries, getAmountOfEntries, getTimeEntrieFromId } from "../controllers/timeEntryController.js";
import { getEmployees, getUserFromToken, isEmployee } from "../controllers/userController.js";
import { getUserSettings } from "../controllers/settingsController.js";
import { addNotification } from "../controllers/notificationController.js";
import { readFile, writeFile } from "fs";
import zip from "express-zip"


const entryRouter = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploads/")
    },
    filename: (req, file, callback) => {
        const fileType = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileType}`;
        callback(null, fileName);
    }
})

const upload = multer({ storage: storage });

entryRouter.post("/time-entry", upload.any(), checkEntryRequest(), express.json(), (req, res) => {
    try {
        const user = getUserFromToken(getCookies(req).token);
        const title = req.body.title;
        const start = req.body.start;
        const end = req.body.end;
        const description = req.body.description;
        let files = [];

        for (const file of req.files) {
            console.log("HERE", file.path);
            files.push(file.path);
        }

        const result = insertEntry(user.id, title, start, end, description, JSON.stringify(files));

        const entry = {
            id: result.lastInsertRowid,
            title: title,
            start: start,
            end: end,
            description: description,
            files: JSON.stringify(files)
        }

        console.log(entry);
        console.log(user.boss);

        if (user.boss != "") {
            user.boss.split(",").forEach((bossId) => {
                addNotification(user.id, parseInt(bossId), entry, user.name + " made a new time entry.", new Date().toLocaleString());
            })
        }

        res.status(201).json({ message: "Entry submitted successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err });
    }
})

entryRouter.get("/analyse", (request, response) => {
    let token = getCookies(request).token;
    if (!token) {
        response.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;
    response.render('pages/analyse', { isAdmin: isAdmin });
});

entryRouter.get("/input", (request, response) => {
    let token = getCookies(request).token;
    if (!token) {
        response.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;
    response.render('pages/input', { isAdmin: isAdmin });
});

entryRouter.get("/get-time-entries", (request, response) => {
    try {
        let date = request.query.date;
        console.log(date);

        const user = getUserFromToken(getCookies(request).token);

        let entries = [];
        if (!date) {
            entries = getTimeEntries(user.id);
        }
        else {
            entries = getTimeEntries(user.id, "%", date.concat("T00:00:00"), date.concat("T23:59:59"), "%");
        }

        response.status(200).json({ timeEntries: entries });
    } catch (err) {
        response.status(401).json({ error: err });
    }
});

entryRouter.get("/download-files", (req, res) => {
    const user = getUserFromToken(getCookies(req).token);
    let entry = getTimeEntrieFromId(req.query.id);

    // checken of permisie voor data
    if (user.id != entry.user_id) {
        let test = true;
        for (let e of getEmployees(user.id)) {
            if (e) {
                if (e.id == entry.user_id) {
                    test = false;
                }
            }
        }
        if (test) {
            res.status(401).end();
            return;
        }
    }

    let files = JSON.parse(entry.files);
    if (files.length == 1) {
        res.download(path.join(process.cwd(), files[0]));
    } else {
        let zipFiles = [];
        for (let file of files) {
            zipFiles.push({ path: file, name: path.basename(file) });
        }

        res.zip(zipFiles);
    }

});

entryRouter.get("/get-employee-entries", (request, response) => {
    const employeeId = parseInt(request.query.id);
    const start = request.query.from != null ? request.query.from : "0000-01-01 00:00:00";
    const end = request.query.to != null ? request.query.to : "9999-12-31 23:59:59";

    const user = getUserFromToken(getCookies(request).token);
    if (!isEmployee(user.id, employeeId)) {
        response.status(401).json({ error: "unauthorized" }).end();
        return;
    }

    try {
        const employeeEntries = getTimeEntries(employeeId, "%", start, end, "%");

        response.status(200).json({ employeeEntries: employeeEntries });
    }
    catch (err) {
        response.status(400).json({ error: err });
    }
})

entryRouter.get("/get-amount-of-entries", (request, response) => {
    const start = request.query.from;
    const end = request.query.to;

    const user = getUserFromToken(getCookies(request).token);

    const entries = getAmountOfEntries(user.id, start, end);

    response.status(200).json(entries);
})

entryRouter.get("/export-list", async (request, response) => {
    try {
        const user = getUserFromToken(getCookies(request).token);
        let timeEntries = [];

        if (!request.query.id) {
            timeEntries = getTimeEntries(user.id);
        } else {
            let employeeId = request.query.id;
            if (!isEmployee(user.id, employeeId)) {
                response.status(401).json({ error: "unauthorized" }).end();
                return;
            }
            timeEntries = getTimeEntries(employeeId);
        }


        timeEntries.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        const document = new PDFDocument();

        response.setHeader('Content-type', 'application/pdf');
        response.setHeader('Content-Disposition', 'attachment; filenam="time_entries.pdf');

        document.pipe(response);

        document.fontSize(20).text('Time Entries: ' + user.email, { align: 'center' });
        document.moveDown();

        timeEntries.forEach(entry => {
            const startDate = new Date(entry.start_time).toLocaleString();
            const endDate = new Date(entry.end_time).toLocaleString();

            document.fontSize(14).text(`Title: ${entry.title}`);
            document.fontSize(12).text(`Date: ${startDate} - ${endDate}`);
            document.fontSize(12).text(`Description: ${entry.description}`);
            document.moveDown();

            if (entry.files && entry.files.length > 0) {
                for (const file of JSON.parse(entry.files)) {
                    if (document.y + 300 > document.page.height - document.page.margins.bottom) {
                        document.addPage();
                    }

                    try {
                        document.image(file, {

                            fit: [400, 300],
                            align: 'center',
                            valign: 'center'
                        });
                        document.moveDown(22);
                    }
                    catch (err) {
                        console.error(`Failed to load image: ${file}`, err);
                        document.fontSize(10).text(`(Failed to load image: ${file})`, { align: 'center' });
                        document.moveDown();
                    }
                }
            }
            document.moveDown();
        });

        document.end();
    }
    catch (err) {
        response.status(500).json({ error: "Failed to generate PDF" });
    }
})

entryRouter.get("/get-amount-employee-entries", (request, response) => {
    try {
        const employeeId = request.query.id;
        const start = request.query.from;
        const end = request.query.to;

        const user = getUserFromToken(getCookies(request).token);

        if (!isEmployee(user.id, employeeId)) {
            response.status(401).json({ error: "unauthorized" }).end();
            return;
        }

        const entries = getAmountOfEntries(employeeId, start, end);
        response.status(200).json(entries);
    }
    catch (err) {
        response.status(400).json({ error: err });
    }
})

var waiting = false;
entryRouter.get("/weather-info", (req, res) => {
    if (waiting) {
        readFile(path.join(process.cwd(), "weather.txt"), 'utf8', (err, d) => {
            if (err) {
                return;
            }
            let data = JSON.parse(d);
            if (waiting) {
                res.status(200).json(data);
                return
            }
        });
        return;
    }

    waiting = true;
    // do api call once an hour
    setTimeout(function () { waiting = false; }, 3600000);

    let url = "http://api.weatherstack.com/current?access_key=" + process.env.API_KEY + "&query=fetch:ip";
    fetch(url, {
        method: "get"
    }).then(res => {
        return res.json();
    }).then(json => {
        writeFile('weather.txt', JSON.stringify(json), e => { });
        if (json.succes != null) {
            console.log("API FAILED: " + json.error.info);
            res.status(502).json(json.error);
            return;
        }
        res.status(200).json(json);
        return;
    });

});

export { entryRouter };
