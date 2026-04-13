import log from "../logger";
import {Types} from "mongoose";
import {NextFunction, Request, Response} from "express";
import {userSchemaValidation} from "../models/user";
import {userService} from "../services/userService";

export const profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: { _id: string | Types.ObjectId, role: string } | undefined = req.user
        const userComplete = await userService.findById(user?._id)
        return res.status(200).json(userComplete);
    } catch (e) {
        next(e);
    }
};

export const findUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const result = await userService.findById(id.toString());

        log.info("Requisição efetuada com sucesso, id encontrado");
        return res.status(200).json({
            message: "Usuário encontrado com sucesso",
            result: result
        });
    } catch (e) {
        next(e);
    }
}

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;

        const {id} = req.params;

        await userService.deleteUserById(id.toString());

        log.info({userId: user?._id}, "Usuário deletado com sucesso");
        return res.status(200).json({message: "Usuário deletado com sucesso"});
    } catch (e) {
        next(e);
    }
}

export const userUpdatedById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
        const {id} = req.params;
        const validationData = userSchemaValidation.parse(req.body);

        await userService.updatedById(id.toString(), validationData);

        log.info({userId: user?._id}, "Usuário atualizado com sucesso");
        return res.status(200).json({message: "Usuário atualizado com sucesso"});
    }
    catch (e) {
        next(e);
    }
}

export const listProductsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;

        const resultProducts = await userService.listProductsByUserId(user?._id as string);

        log.info("Lista de produtos encontrados com base no userCreate");

        return res.status(200).json({
            message: "Lista de produtos encontrados",
            result: resultProducts
        });
    } catch (e) {
        return res.status(300).json({})
    }
}