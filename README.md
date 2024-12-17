# WebProgrammingProject

repo for the web programming project

## Structure

- `app.js`: web server entrypoint
- `db.js`: database entrypoint
- `public/`: folder with static resources

## Included

**Bootstrap**

- https://getbootstrap.com/
  - `<link rel="stylesheet" href="css/bootstrap.css">`
  - `<script src="js/bootstrap.bundle.js"></script>`
- https://icons.getbootstrap.com/
  - `<link rel="stylesheet" href="css/bootstrap-icons.css">`

**Express**

- https://expressjs.com/
- https://express-validator.github.io/docs/next/
- https://ejs.co/
- https://github.com/WiseLibs/better-sqlite3/

## Local development

run: `node app.js`

## Deployment

build: `docker build -t time-tracking-system-jy .`
run: `docker run -it -p 8080:8080 time-tracking-system-jy`
