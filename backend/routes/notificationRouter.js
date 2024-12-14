import express from "express";
import { getCookies } from "../middleware/authorization.js";
import { getUserNotifications, readNotification } from "../controllers/notificationController.js";
import { getUserFromToken } from "../controllers/userController.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render("pages/notifications")
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


export { notificationRouter };