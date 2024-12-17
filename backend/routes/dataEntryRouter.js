import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import PDFDocument from "pdfkit";
import { checkEntryRequest } from "../middleware/formChecking.js";
import { getCookies, tokenKey } from "../middleware/authorization.js";
import { insertEntry, getTimeEntries, getAmountOfEntries } from "../controllers/timeEntryController.js";
import { getEmployees, getUserFromToken, getUsers } from "../controllers/userController.js";
import { getUserSettings } from "../controllers/settingsController.js";

const entryRouter = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "/public/tmp/uploads/")
    },
    filename: (req, file, callback) => {
        const fileType = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileType}`;
        callback(null, fileName);
    }
})

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
    let token = getCookies(request).token;
    if (!token) {
        response.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;
    response.render('pages/analyse', {isAdmin: isAdmin});
});

entryRouter.get("/input", (request, response) => {
    let token = getCookies(request).token;
    if (!token) {
        response.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;
    response.render('pages/input', {isAdmin: isAdmin});
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
    const employee = getUsers("%", request.body.email);
    const start = request.body.start;
    const end = request.body.end;

    try {
        const adminEmployees = getEmployees(getUserFromToken(getCookies(request).token).id);
        if (adminEmployees.includes(employee)) {
            const employeeEntries = getTimeEntries(employee.id, "%", start, end, "%");
    
            response.status(200).json(employeeEntries);
        }
        else {
            throw new Error("user is not an employee of this admin.");
        }
    }
    catch (err) {
        response.status(400).json({error: err});
    }
})

entryRouter.get("/export-list", async (request, response) => {
    try {
        const user = getUserFromToken(getCookies(request).token);
        const timeEntries = getTimeEntries(user.id);

        timeEntries.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        const document = new PDFDocument();

        response.setHeader('Content-type', 'application/pdf');
        response.setHeader('Content-Disposition', 'attachment; filenam="time_entries.pdf');

        document.pipe(response);

        document.fontSize(20).text('Time Entries: ' + user.email, {align: 'center'});
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
        response.status(500).json({error: "Failed to generate PDF"});
    }
})

export { entryRouter };
