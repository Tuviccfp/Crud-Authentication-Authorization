import express, { Express } from "express";
import "dotenv/config";
import cors from "cors";
import cookieparser from "cookie-parser"

import {connectDatabase} from "./config/database";
import authRouter from "./router/auth.router";
import productRouter from "./router/product.router";
import userRouter from "./router/user.router";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(cookieparser());
connectDatabase();

app.use("/api/login", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

app.get("/", (req, res) => {
    res.status(201).send("Hello World");
});

app.listen(8080, (): void => {
    console.log("App connected in port 3000");
});