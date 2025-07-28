import { Router, Request, Response } from "express";
import {User, UserTypes} from "../../models/user";
import {jwtSign} from "../../middleware";
import log from '../../logger';

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
    try {
        const data: UserTypes = req.body;
        const {name, password, email} = data;
        log.info({ email }, "Tentativa de novo registro de e-mail");

        if(!name || !password || !email ) {
            log.warn({ email }, "Tentativa de novo registro falhou: campos obrigatorios em branco!");
            return res.status(400).send("Não é permitido campos vazios");
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            log.warn({ email }, "Tentativa de criar conta com o e-mail ja registrado");
            return res.status(409).json({message: "E-mail já em uso"});
        }

        const newUser = await User.create({
            name,
            password,
            email,
        });

        log.info({email, userId: newUser._id}, "Usuário registrado com sucesso!");
        return res.status(201).send("Usuário criado com sucesso!");
    } catch (e) {
        log.error(`Erro interno no servidor, erro de tempo de execução: ${e}`);
        return res.status(500).json({
            message: "Erro interno no servidor"
        });
    }
});

router.post("/enter", async (req: Request, res: Response) => {
   try {
       const data: {email: string, password: string}  = req.body as {email: string, password: string};
       const { email, password } = data

        if(!email || !password) return res.status(400).json({
            message: "Não é permitido campos vazios"
        });

       const returnUser = await User.findOne({email: email});

       if(!returnUser || !await returnUser.checkPassword(password)) return res.status(401).json({
           message: "E-mail ou senha inválidos"
       });

       const payload = {
           _id: returnUser._id,
           role: returnUser.role
       }
       const token: string = jwtSign(payload);

       log.info({ user: returnUser._id }, "Usuário criado com sucesso!");
       return res.status(200).json({
           token,
           _id: returnUser._id,
       });
   } catch (e) {
       return res.status(500).send("Erro ao entrar no sistema!");
   }
});

export default router;