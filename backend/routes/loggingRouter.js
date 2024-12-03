import express from "express";
import { db } from "../../db.js";
import { insertUser, getUsers } from "../controllers/userController.js";
import { checkRegisterRequest } from "../middleware/formChecking.js";
import { authorizeRole, createToken, getCookies, getUserFromToken } from "../middleware/authorization.js";

const logRouter = express.Router();

logRouter.get("/", (request, response) => {
    const userToken = getCookies(request).token;
    if (!userToken) {
        response.redirect("/login");
        return;
    }

    const user = getUserFromToken(userToken);
    let usesDarkMode = 0;
    if (user != null) {
        usesDarkMode = db.prepare("SELECT darkMode FROM settings WHERE userId = ?").all(user.id);
    }

    if (usesDarkMode[0].darkMode == 1) {
        response.header("config", "dark");
    }
    else {
        response.header("config", "light");
    }

    response.render('pages/home');
});

logRouter.get("/login", (request, response) => {
    response.render('pages/login');
});

logRouter.get("/register", (request, response) => {
    response.render('pages/register');
});

logRouter.get("/settings", (request, response) => {
    const userToken = getCookies(request).token;
    if (!userToken) {
        response.redirect("/login");
        return;
    }

    const user = getUserFromToken(userToken);
    let userSettings = null;
    if (user != null) {
        userSettings = db.prepare("SELECT * FROM settings WHERE userId = ?").all(user.id)[0];
    }

    if (userSettings != null) {
        if (userSettings.darkMode == 1) {
            response.header("darkMode", "dark");
        }
        else {
            response.header("darkMode", "light");
        }

        response.header("analyseView", userSettings.analyseView);
    }

    response.render('pages/settings');
});

logRouter.get("/logout", (request, response) => {
    // delete token on logout
    response.cookie("token", "", {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now()),
    });

    response.redirect("/login");
});
  
  
// register
logRouter.post("/register", express.json(), checkRegisterRequest(), async (req, res) => {
    try {
        const result = await insertUser(req.body.username, req.body.email, req.body.password, "user");
        res.status(201).json({ id: result.lastInsertRowid });

    } catch (err) {
        res.status(400).json({ error: "User with this email already exists." });
    }
})
  
  
// login and users
logRouter.get("/users", authorizeRole("admin"), (req, res) => {
    const users = getUsers();
    res.json(users);
})
  
logRouter.post("/login", express.json(), async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const token = await createToken(email, password);
    if (token == null) {
        return res.status(400).json({ error: "Wrong email or password." });
    }

    console.log(token);

    // token opslaan als cookie
    res.cookie("token", token, {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + 10800000), // 3hr
    });

    res.status(200).json({ message: "Login successful." });
})

// settings
logRouter.post("/settings", express.json(), (req, res) => {
    const usesDarkMode = req.body.darkMode;
    const analyseView = req.body.analyseView

    const userToken = getCookies(req).token;
    const user = getUserFromToken(userToken);

    db.prepare("UPDATE settings SET darkMode = ?, analyseView = ? WHERE userId = ?").run(usesDarkMode, analyseView, user.id);
})

export {logRouter};