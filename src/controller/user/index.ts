import { Router, Request, Response } from 'express';
import {authenticated, validRole} from "../../middleware";
import {Types} from "mongoose";
import log from "../../logger";

const router = Router();

router.get("/profile", [authenticated, validRole], async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> => {
    const user: { _id: string | Types.ObjectId, role: string } | undefined = req.user
    if (!user?._id && !user?.role) {
        log.warn({ _id: user?._id }, "Credências inválidas, permissão negada!");
        return res.status(401).json({
            message: "Credências inválidas, permissão negada!"
        });
    }
    const { _id, role } = user;
    try {
        log.info({ _id: _id }, "Usuário conectado com sucesso!");
        return res.status(200).json({ _id: _id, role: role });
    } catch (e) {
        log.info({e: e}, "Credências inválidas, permissão negada!");
        return res.status(401).json({
            message: "Credências inválidas, permissão negada!"
        });
    }
});

export default router;
