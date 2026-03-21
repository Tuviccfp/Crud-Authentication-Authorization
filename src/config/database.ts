import mongoose from "mongoose";
import {NextFunction} from "express";
import log from "../logger";
export async function connectDatabase(retries: 5, delay: 1000): Promise<void> {
    if (!process.env.MONGODB_URL) throw new Error(
        "Please, set the MONGODB_URL environment variable"
    );
    for(let attempt = 0; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(process.env.MONGODB_URL as string);
            log.info("Conectado ao banco de dados");
            return;
        }
        catch (e) {
            log.error(`Erro ao se conectar com o mongoDB, ${e}, tentativa atual: ${attempt} de ${retries}`);
            if(attempt === retries) throw new Error("Erro ao se conectar com o mongoDB");
            const waitTime = delay * 2 ** (attempt - 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}