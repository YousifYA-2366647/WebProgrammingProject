import Database from "better-sqlite3";

const db = new Database("database.db", { verbose: console.log });

export { db };

export function InitializeDatabase() {
  db.pragma("journal_mode = WAL;");
  db.pragma("busy_timeout = 5000;");
  db.pragma("synchronous = NORMAL;");
  db.pragma("cache_size = 1000000000;");
  db.pragma("foreign_keys = true;");
  db.pragma("temp_store = memory;");

  prepareUsers();

  db.prepare(`CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    start_time TEXT, 
    end_time TEXT, 
    note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
    )`).run();
}


function prepareUsers() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
    ) STRICT`).run();

  const exampleUsers = [
    { name: "Peter" },
    { name: "Jori" },
    { name: "Joris" },
    { name: "Mike" },
  ];

  const findUser = db.prepare("SELECT id FROM users WHERE name = ?");
  const insertUser = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
  let i = "a";
  exampleUsers.forEach((user) => {
    if (!findUser.get(user.name)) {
      const email = user.name + "@gmail.com";
      insertUser.run(user.name, email, i);
    }
  });
}