import express, { Express } from "express";
import "dotenv/config";

import loginRoute from "./controller/login";
import userRoute from "./controller/user";
import productRoute from "./controller/product";

import {connectDatabase} from "./config/database";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

connectDatabase();

app.use("/api/login", loginRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);

app.get("/", (req, res) => {
    res.status(201).send("Hello World");
});

app.listen(3000, (): void => {
    console.log("App connected in port 3000");
});