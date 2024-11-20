import express from "express";
import { InitializeDatabase, db } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from 'path';
import Joi from "joi";

const app = express();
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080
const tokenKey = "MaeuM";

// hulp functies
function authorizeRole(role) {
  return (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({error: "Access Denied"});

    try {
      const decoded = jwt.verify(token, tokenKey);
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(decoded.email);
      console.log(user);
      if (user.role != role) {
        return res.status(403).json({error: "Forbidden entry"});
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({error: "Invalid Token"});
    }
  }
}

async function insertUser(username, email, password, role) {

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
  const result = insertUser.run(username, email, hashedPassword, role);
  console.log(result);
  return result;
}

async function createToken(email, password) {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    console.log("User doesn't exist.");
    return null;
  }
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    console.log(password + " " + user.password)
    console.log("Wrong password.");
    return null;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, tokenKey, { expiresIn: "3h" });
  return token;
}

function checkRegisterRequest() {
  return (req, res, next) => {
    const registerForm = Joi.object( {
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
    })

    const {error} = registerForm.validate(req.body);
    if (error) {
      console.log(error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
}

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
  response.sendFile(path.join(process.cwd(), "public/home.html"));
});

app.get("/login", (request, response) => {
  response.sendFile(path.join(process.cwd(), "public/login.html"));
});

app.get("/register", (request, response) => {
  response.sendFile(path.join(process.cwd(), "public/register.html"));
});

app.get("/logout", (request, response) => {
  response.redirect("/login");
});

app.get("/analyse", (request, response) => {
  response.sendFile(path.join(process.cwd(), "public/analyse.html"));
});

app.get("/input", (request, response) => {
  response.sendFile(path.join(process.cwd(), "public/input.html"));
});

app.get("/settings", (request, response) => {
  response.sendFile(path.join(process.cwd(), "public/settings.html"));
});


// register
app.post("/register", express.json(), checkRegisterRequest(), async (req, res) => {
  try {
    const result = insertUser(req.body.username, req.body.email, req.body.password, "user");
    res.status(201).json({ id: result.lastInsertRowid });

  } catch (err) {
    res.status(400).json({ error: "User with this email already exists." });
  }
})


// login and users
app.get("/users", authorizeRole("admin"), (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
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
  res.status(200).json({ message: "Login successful.", token });
})


// time entry handling
app.get("/time-entry", (req, res) => {
  const entries = db.prepare("SELECT * FROM time_entries").all();
  res.json(entries);
})

app.post("/time-entry", express.json(), (req, res) => {
  const { userId, startTime, endTime, note } = req.body;

  const insertEntry = db.prepare(`
    INSERT INTO time_entries (user_id, start_time, end_time, note) 
    VALUES (?, ?, ?, ?)
  `);
  const result = insertEntry.run(userId, startTime, endTime, note);

  res.status(201).json({ id: result.lastInsertRowid });
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
