import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import session from "express-session";
import actions from "./utils/githubActions";
import "./utils/loadEnv";
const path = require("path");
const args = process.argv.slice(2);

const app = express();
const port = 2082;

app.use(
    cors({
        origin: ["http://localhost:3001", "http://localhost:3000"],
        credentials: true
    })
);

// GitHub Actions
if (args.includes("-database")) {
    actions(args);
}
// End GitHub Actions

import "./database";
const mysqlStore = require("./mysqlStore");
app.set("trust proxy", true);

import router from "./routes/index";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: true,
        store: mysqlStore,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.use("/api", router);
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (_: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(port, () => {
    console.log("Server online!");
});
