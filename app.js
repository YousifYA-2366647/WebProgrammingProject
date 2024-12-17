import express from "express";
import { InitializeDatabase } from "./db.js";
import { logRouter } from "./backend/routes/loggingRouter.js";
import { entryRouter } from "./backend/routes/dataEntryRouter.js"
import { settingsRouter } from "./backend/routes/settingsRouter.js";
import { notificationRouter } from "./backend/routes/notificationRouter.js";
import { employeeRouter } from "./backend/routes/employeeRouter.js";

const app = express();
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080

export {app};

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

// home pagina
app.get("/", logRouter);

// register
app.post("/register", logRouter);

// login and users
app.get("/login", logRouter);

app.get("/register", logRouter);

app.get("/logout", logRouter);

app.get("/users", logRouter);

app.post("/login", logRouter);

// settings
app.get("/settings", settingsRouter);

app.post("/settings", settingsRouter);

// time entry handling
app.get("/analyse", entryRouter);

app.get("/input", entryRouter);

app.post("/time-entry", entryRouter);

app.get("/get-time-entries", entryRouter);

app.get("/get-time-entries", entryRouter);

app.get("/get-amount-of-entries", entryRouter);

app.get("/get-employee-entries", entryRouter);

app.get("/get-amount-employee-entries", entryRouter);

app.get("/export-list", entryRouter);

// notifications
app.get("/notifications", notificationRouter);

app.get("/get-notifications", notificationRouter);

app.post("/read-notification", notificationRouter);

app.post("/accept-follow-request", notificationRouter);

app.post("/delete-notification", notificationRouter);

// employees
app.get("/get-employees", employeeRouter);

app.post("/add-employee", employeeRouter);

app.post("/remove-employee", employeeRouter)

app.get("/manage-employees", employeeRouter);

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
