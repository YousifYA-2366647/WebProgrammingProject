import express from "express";
import { InitializeDatabase, db } from "./db.js";
import { checkEntryRequest, checkRegisterRequest } from "./backend/controllers/formChecking.js";
import { authorizeRole, getCookies, createToken, tokenKey } from "./backend/middleware/authorization.js";
import { insertUser, insertEntry } from "./backend/models/inserter.js";
import { getUsers, getTimeEntries } from "./backend/models/getters.js";
import jwt from "jsonwebtoken";
import path from 'path';

const app = express();
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080

// post request kunnen lezen
app.use(express.json());
app.use(express.urlencoded());

// set the view engine to ejs
app.set("view engine", "ejs");

// process.env.DEPLOYMENT is set by Docker Entrypoint
if (!process.env.DEPLOYMENT) {
  console.info("Development mode");
  // Serve static files from the "public" directory
  app.use(express.static("public"));
}

// Middleware for debug logging
app.use((request, response, next) => {
  console.log(
    `Request URL: ${request.url} @ ${new Date().toLocaleString("nl-BE")}`
  );
  next();
});

// pagina's

app.get("/", (request, response) => {
  if (!getCookies(request).token) {
    response.redirect("/login");
    return;
  }

  response.render('pages/home');
});

app.get("/login", (request, response) => {
  response.render('pages/login');
});

app.get("/register", (request, response) => {
  response.render('pages/register');
});

app.get("/analyse", (request, response) => {
  if (!getCookies(request).token) {
    response.redirect("/login");
    return;
  }

  response.render('pages/analyse');
});

app.get("/input", (request, response) => {
  if (!getCookies(request).token) {
    response.redirect("/login");
    return;
  }

  response.render('pages/input');
});

app.get("/settings", (request, response) => {
  if (!getCookies(request).token) {
    response.redirect("/login");
    return;
  }

  response.render('pages/settings');
});

app.get("/logout", (request, response) => {
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
app.post("/register", express.json(), checkRegisterRequest(), async (req, res) => {
  try {
    const result = await insertUser(req.body.username, req.body.email, req.body.password, "user");
    res.status(201).json({ id: result.lastInsertRowid });

  } catch (err) {
    res.status(400).json({ error: "User with this email already exists." });
  }
})


// login and users
app.get("/users", authorizeRole("admin"), (req, res) => {
  const users = getUsers();
  res.json(users);
})

app.post("/login", express.json(), async (req, res) => {
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

// time entry handling
app.get("/analyse", (req, res) => {
  const entries = getTimeEntries();
  res.json(entries);
})

app.post("/time-entry", checkEntryRequest(), express.json(), (req, res) => {
  const userId = jwt.verify(getCookies(req).token, tokenKey).userId;
  const title = req.body.title;
  const start = req.body.start;
  const end = req.body.end;
  const description = req.body.description;
  const files = JSON.stringify(req.body.files);

  insertEntry(userId, title, start, end, description, files);

  res.status(201).json({message: "Entry submitted successfully"});
})

// Middleware for unknown routes
// Must be last in pipeline
app.use((request, response, next) => {
  response.status(404).send("Sorry can't find that!");
});

// Middleware for error handling
app.use((error, request, response, next) => {
  console.error(error.stack);
  response.status(500).send("Something broke!");
});

// App starts here
InitializeDatabase();
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
