import express from "express";
import { getCookies } from "../middleware/authorization.js";
import { getReceiver, getSender, getUserNotifications, readNotification, removeNotification } from "../controllers/notificationController.js";
import { addEmployeeToAdmin } from "../controllers/userController.js";
import { getUserFromToken, getUserById } from "../controllers/userController.js";
import { getUserSettings } from "../controllers/settingsController.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", (request, response) => {
    let token = getCookies(request).token;
    if (!token) {
        response.redirect("/login");
        return;
    }

    let isAdmin = getUserSettings(getUserFromToken(token).id).isAdmin;
    response.render("pages/notifications", {isAdmin: isAdmin})
});

notificationRouter.get("/get-notifications", async (request, response) => {
    try {
        const user = getUserFromToken(getCookies(request).token);

        const notifications = getUserNotifications(user.id);

        console.log(notifications);

        response.status(200).json(notifications);
    }
    catch (error) {
        response.status(400).json({error: "couldn't load notifications"});
    }

})

notificationRouter.post("/read-notification", (request, response) => {
    const notificationId = request.body.notificationId;
    console.log(notificationId);

    if (notificationId) {
        readNotification(notificationId);
    }

    response.status(200);
})

notificationRouter.post("/accept-follow-request", (request, response) => {
    const notificationId = request.body.notificationId;

    const receiverId = getReceiver(notificationId);
    const senderId = getSender(notificationId);

    const sender = getUserById(senderId);

    readNotification(notificationId);
    if (addEmployeeToAdmin(sender, receiverId)) {
        response.status(200).json();
        return;
    }
    response.status(400).json({error: "user is already an employee of admin"});
})

notificationRouter.post("/delete-notification", (request, response) => {
    const notificationId = request.body.notificationId;

    removeNotification(notificationId);

    response.status(200).json();
})


export { notificationRouter };