import express from "express";
import { getCookies } from "../middleware/authorization.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render("pages/notifications")
});


export { notificationRouter };