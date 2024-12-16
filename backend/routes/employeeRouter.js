import express from "express";
import { getUserFromToken, getEmployees, getUsers, removeEmployee } from "../controllers/userController.js";
import { addNotification } from "../controllers/notificationController.js";
import { authorizeRole, getCookies } from "../middleware/authorization.js";
import { getUserSettings } from "../controllers/settingsController.js";

const employeeRouter = express.Router();

employeeRouter.get("/get-employees", (request, response) => {
    const user = getUserFromToken(getCookies(request).token);

    response.status(200).json({employees: getEmployees(user.id)});
})

employeeRouter.post("/add-employee", (request, response) => {
    const employeeEmail = request.body.email;

    if (employeeEmail == getUserFromToken(getCookies(request).token).email) {
        response.status(400).json({error: "can't send request to yourself."});
    }

    const sender = getUserFromToken(getCookies(request).token);
    const receiver = getUsers("%", employeeEmail)[0];
    const title = sender.name + " sent a follow request.";
    const date = new Date().toDateString()

    try {
        addNotification(sender.id, receiver.id, null, title, date);

        response.status(200).json();
    } catch (error) {
        response.status(400).json({error: "Email not found."});
    }
})

employeeRouter.post("/remove-employee", (request, response) => {
    const employeeEmail = request.body.email;
    const userId = getUserFromToken(getCookies(request).token).id;
    const employeeId = getUsers("%", employeeEmail)[0].id;

    if (removeEmployee(userId, employeeId)) {
        response.status(200).json();
        return;
    }
    response.status(400).json({error: "email is not an employee."});
})

employeeRouter.get("/manage-employees", (req, res) => {
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
export { employeeRouter };