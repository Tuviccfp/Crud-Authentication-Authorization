import {NextFunction, Request, Response} from "express";
import { userSchemaValidation } from "../models/user";
import log from "../logger";
import {cookieToken, jwtSign} from "../middleware";
import {userService} from "../services/userService";

const loginSchemaValidation = userSchemaValidation.pick({email: true, password: true});

export const authController = {

    async helloMessage (req: Request, res: Response) {
        try {
            return res.send("Hello World")
        } catch (e) {
            return res.status(500).send("Erro interno do servidor")
        }
    },

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const userValidated = userSchemaValidation.parse(req.body);
            log.info("Tentativa de novo registro de e-mail");

            const result = await userService.registerUser(userValidated);

            log.info({email: userValidated.email, userId: result._id}, "Usuário registrado com sucesso!");
            return res.status(201).send("Usuário criado com sucesso!");
        } catch (e) {
            next(e);
        }
    },

    async enter(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = loginSchemaValidation.parse(req.body);
            const resultUser = await userService.enterUser(validatedData.email, validatedData.password);
            cookieToken(res, resultUser.role, resultUser._id)

            log.info("Um solicitacao login foi realizada com sucesso");

            return res.status(200).json({
                message: "Login realizado com sucesso"
            })
        } catch (e) {
            next(e);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            await userService.logout(res);
            return res.status(200).json({message: "Logout realizado com sucesso!"});
        } catch (e) {
            next(e);
        }
    }
}
