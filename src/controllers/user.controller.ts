import log from "../logger";
import {Types} from "mongoose";
import {Request, Response} from "express";

export const profile = async (req: Request, res: Response) => {
    try {

        const user: { _id: string | Types.ObjectId, role: string } | undefined = req.user

        log.info({ _id: user?._id }, "Usuário conectado com sucesso!");

        return res.status(200).json({ _id: user?._id, role: user?.role });

    } catch (e) {
        log.info({e: e}, "Credências inválidas, permissão negada!");
        return res.status(401).json({
            message: "Credências inválidas, permissão negada!"
        });
    }
};