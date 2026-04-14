import express, {Express, Request, Response, NextFunction} from "express";
import "dotenv/config";
import cors from "cors";
import cookieparser from "cookie-parser"
import {connectDatabase} from "./config/database";
import authRouter from "./router/auth.router";
import productRouter from "./router/product.router";
import userRouter from "./router/user.router";
import log from "./logger";
import {middlewareError} from "./middleware";
import Redis from "ioredis";
const app: Express = express();

export const redis = new Redis();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(cookieparser());

app.get("/", (req, res) => {
    res.status(201).send("Hello World");
});

app.use("/api/login", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

app.use(middlewareError);

app.listen(8080, (): void => {
    try {
        log.info("Servidor rodando na porta 8080");
        connectDatabase(5, 1000);
    } catch (e) {
        log.error("Erro ao subir aplicação");
    }
});