import express from "express";
import { InitializeDatabase, db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080
const tokenKey = "MaeuM";

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

app.get("/", (request, response) => {
  response.redirect('/login.html')
});

app.get("/login", (request, response) => {
  response.redirect('/login.html')
});

app.get("/create-account", (request, response) => {
  response.redirect('/create-account.html')
});

// register
app.post("/register", express.json(), async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({error: "Username and password are required."});
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const insertUser = db.prepare("INSERT INTO users (name, password) VALUES (?, ?)")
    const result = insertUser.run(username, hashedPassword);
    res.status(201).json({id: result.lastInsertRowid});
  } catch (error) {
    res.status(400).json({error: "Username already exists."});
  }
})


// login and users
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, tokenKey, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

app.get("/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
})

app.post("/login", express.json(), async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = db.prepare("SELECT * FROM users WHERE name = ?").get(username);

  if (!user) {
    return res.status(400).json({error: "No users found."});
  }
  if (password != user.password) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log(password + " " + user.password)
      return res.status(400).json({error: "Wrong Password."});
    }
  }

  const token = jwt.sign({userId: user.id}, tokenKey, {expiresIn: "3h"});
  res.status(200).json({ message: "Login successful.", token});
})


// time entry handling
app.get("/time-entry", (req, res) => {
  const entries = db.prepare("SELECT * FROM time_entries").all();
  res.json(entries);
})

app.post("/time-entry", express.json(), (req, res) => {
  const {userId, startTime, endTime, note} = req.body;

  const insertEntry = db.prepare(`
    INSERT INTO time_entries (user_id, start_time, end_time, note) 
    VALUES (?, ?, ?, ?)
  `);

  const result = insertEntry.run(userId, startTime, endTime, note);
  res.status(201).json({id: result.lastInsertRowid});
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
