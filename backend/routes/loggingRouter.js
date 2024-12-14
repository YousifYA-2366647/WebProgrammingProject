import express from "express";
import { db } from "../../db.js";
import { insertUser, getUsers } from "../controllers/userController.js";
import { checkRegisterRequest } from "../middleware/formChecking.js";
import { authorizeRole, createToken, getCookies } from "../middleware/authorization.js";
import { getUserSettings } from "../controllers/settingsController.js";

const logRouter = express.Router();

logRouter.get("/", (request, response) => {
    if (!getCookies(request).token) {
        response.redirect("/login");
        return;
    }

    response.render('pages/home');
});

logRouter.get("/login", (request, response) => {
    response.render('pages/login');
});

logRouter.get("/register", (request, response) => {
    response.render('pages/register');
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
        const result = await insertUser(req.body.username, req.body.email, req.body.password, req.body.role, "");
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

    const user = db.prepare("SELECT * FROM users WHERE email = ?").all(email)[0];
    const userSettings = getUserSettings(user.id);

    console.log(userSettings);

    res.status(200).json({ message: "Login successful.", settings: userSettings });
})

export {logRouter};