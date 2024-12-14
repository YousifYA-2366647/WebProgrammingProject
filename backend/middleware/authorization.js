import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {db} from "../../db.js";


const tokenKey = "MaeuM";

export { tokenKey };

export function authorizeRole(role) {
    return (req, res, next) => {
      const token = req.headers.authorization;
      if (!token) return res.status(401).json({ error: "Access Denied" });
  
      try {
        const decoded = jwt.verify(token, tokenKey);
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(decoded.email);
        if (user.role != role) {
          return res.status(403).json({ error: "Forbidden entry" });
        }
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: "Invalid Token" });
      }
    }
}


export async function createToken(email, password) {
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


export function getCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
  
    // geen cookies
    if (!cookieHeader) return list;
  
    cookieHeader.split(`;`).forEach(function (cookie) {
      let [name, ...rest] = cookie.split(`=`);
      name = name?.trim();
      if (!name) return;
      const value = rest.join(`=`).trim();
      if (!value) return;
      list[name] = decodeURIComponent(value);
    });
  
    return list;
}