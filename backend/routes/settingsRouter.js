import express from "express";

const settingsRouter = express.Router();

settingsRouter.get("/settings", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render('pages/settings');
});

settingsRouter.post("/settings", (request, response) => {
    const usesDarkmode = request.body.darkMode;
    const analyseView = request.body.analyesView;

    const userToken = getCookies(request).token;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(jwt.verify(userToken, tokenKey))[0];

    updateUserSettings(user.id, usesDarkmode, analyseView);

    response.status(200);
})

export {settingsRouter}