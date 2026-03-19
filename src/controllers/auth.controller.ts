import {NextFunction, Request, Response} from "express";
import {User, userSchemaValidation, UserTypes} from "../models/user";
import log from "../logger";
import {cookieToken, jwtSign} from "../middleware";
import {productSchemaValidation} from "../models/product";

const loginSchemaValidation = userSchemaValidation.pick({email: true, password: true});

export const helloMessage = async (req: Request, res: Response) => {
    try {
        return res.send("Hello World")
    } catch (e) {
        return res.status(500).send("Erro interno do servidor")
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const userValidated = userSchemaValidation.parse(req.body);

        log.info("Tentativa de novo registro de e-mail");

        const existingUser = await User.findOne({ email: userValidated.email });
        if(existingUser) {
            log.warn({ email: userValidated.email }, "Tentativa de criar conta com o e-mail ja registrado");
            return res.status(409).json({message: "E-mail já em uso"});
        }

        const newUser = await User.create(userValidated);

        log.info({email: userValidated.email, userId: newUser._id}, "Usuário registrado com sucesso!");
        return res.status(201).send("Usuário criado com sucesso!");
    } catch (e) {
        next(e);
    }
}

export const enter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = loginSchemaValidation.parse(req.body);

        const returnUser = await User.findOne({email: validatedData.email });

        if(!returnUser || !await returnUser.checkPassword(validatedData.password)) return res.status(401).json({
            message: "E-mail ou senha inválidos"
        });
        cookieToken(res, returnUser.role, returnUser._id)
        log.info("Um solicitacao login foi realizada com sucesso");
        return res.status(200).json({
            message: "Login realizado com sucesso"
        })
    } catch (e) {
        next(e);
    }

}