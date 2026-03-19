import {Request, Response} from "express";
import {User, userSchemaValidation, UserTypes} from "../models/user";
import log from "../logger";
import {jwtSign} from "../middleware";
import {productSchemaValidation} from "../models/product";

export const helloMessage = async (req: Request, res: Response) => {
    try {
        return res.send("Hello World")
    } catch (e) {
        return res.status(500).send("Erro interno do servidor")
    }
}

export const register = async (req: Request, res: Response) => {

    try {
        const data: UserTypes = req.body;
        const userValidated = userSchemaValidation.parse(data);
        const {name, password, email} = userValidated;

        log.info("Tentativa de novo registro de e-mail");

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
}

export const enter = async (req: Request, res: Response) => {
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

        log.info({ user: returnUser._id }, "Usuario criado com sucesso!");
        res.cookie("authToken", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        log.info("Um solicitacao login foi realizada com sucesso");
        return res.status(200).json({
            message: "Login realizado com sucesso"
        })
    } catch (e) {
        return res.status(500).send("Erro ao entrar no sistema!");
    }

}