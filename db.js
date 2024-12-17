import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const db = new Database("database.db", { verbose: console.log });

export { db };

export function InitializeDatabase() {
  db.pragma("journal_mode = WAL;");
  db.pragma("busy_timeout = 5000;");
  db.pragma("synchronous = NORMAL;");
  db.pragma("cache_size = 1000000000;");
  db.pragma("foreign_keys = true;");
  db.pragma("temp_store = memory;");

  prepareSettingsTable();
  prepareNotificationTable();
  prepareUsers();

  db.prepare(`CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, 
    title TEXT NOT NULL,
    start_time TEXT NOT NULL, 
    end_time TEXT NOT NULL, 
    description TEXT NOT NULL,
    files TEXT[],
    FOREIGN KEY (user_id) REFERENCES users(id)
    )`).run();
}

function prepareSettingsTable() {
  db.prepare(`CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER NOT NULL,
    usesDarkMode INTEGER NOT NULL,
    analyseView TEXT NOT NULL,
    isAdmin INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
    ) STRICT`).run();
}

function prepareNotificationTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    entry_id INTEGER,
    title TEXT NOT NULL,
    preview TEXT NOT NULL,
    date TEXT NOT NULL,
    is_read INTEGER NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (entry_id) REFERENCES time_entries(id)
    )
    `).run()
}


async function prepareUsers() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    employees TEXT NOT NULL,
    boss TEXT NOT NULL
    ) STRICT`).run();

  const exampleUsers = [
    { name: "Peter" },
    { name: "Jori" },
    { name: "Joris" },
    { name: "Mike" },
  ];

  const findUser = db.prepare("SELECT id FROM users WHERE name = ?");
  const insertUser = db.prepare("INSERT INTO users (name, email, password, employees, boss) VALUES (?, ?, ?, ?, ?)");

  const makeUserSettings = db.prepare("INSERT INTO settings (user_id, usesDarkMode, analyseView, isAdmin) VALUES (?, ?, ?, ?)")

  let password = "a";
  const hashedPassword = await bcrypt.hash(password, 10);
  exampleUsers.forEach((user) => {
    if (!findUser.get(user.name)) {
      const email = user.name + "@gmail.com";
      insertUser.run(user.name, email, hashedPassword, "", "");
      const currentUser = findUser.all(user.name)[0];
      makeUserSettings.run(currentUser.id, 0, "list", 1);
    }
  });
}