import { Router, Request, Response } from 'express';
import {authenticated, validRole} from "../../middleware";
import {Document, Types} from "mongoose";
import log from "../../logger";
import {Product} from "../../models/product";

const router = Router();

router.post("/register", [authenticated, validRole], async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> => {
    const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
    if(!user?._id && !user?.role) {
        log.warn({_id: user?._id}, "Credênciais inválidas, permissão negada!");
        return res.status(401).json({
            message: "Credênciais inválidas, permissão negada!"
        })
    }
    try {
        const {name, price, description, image} = req.body;
        if(!name || !price || !description || !image) {
            return res.status(400).json({
                message: "Não é permitido campos vazios"
            })
        }
        await Product.create({
            name,
            price,
            description,
            image,
            userCreate: user._id,
        })
        log.info({name: name, userCreate: user._id}, "Produto cadastrado com sucesso!");
        return res.status(200).json({
            message: "Produto cadastrado com sucesso!"
        });
    } catch (e) {
        log.info({e: e}, "Erro ao cadastrar produto");
    }
});

router.get("/show-all", async (req: Request, res: Response) => {
    try {
        const result = await Product.findOne({});
        if(!result) return res.status(404).json({
            message: "Ainda não existe nada registrado"
        });

        log.info({result: result}, "Resultado do produto");
        return res.status(200).json({
            products: result,
        });
    } catch (e) {
        log.info({e: e}, "Erro ao buscar produto");
        return res.status(500).json({
            message: "Erro ao buscar produto"
        });
    }
});

export default router;