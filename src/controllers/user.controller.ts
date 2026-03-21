import log from "../logger";
import { z } from "zod";
import {Types} from "mongoose";
import {NextFunction, Request, Response} from "express";
import {User, userSchemaValidation} from "../models/user";
import {ApiError} from "../utils/ApiError";

// const 
export const profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: { _id: string | Types.ObjectId, role: string } | undefined = req.user
        const userComplete = await User.findById(user?._id).select("-password");
        return res.status(200).json(userComplete);
    } catch (e) {
        next(e);
    }
};

export const findUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        if(!id) throw new ApiError(400, "Não foi encontrado nenhum id para a busca");

        const result = await User.findById({_id: id}).select("-password");

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

        if(!id) throw new ApiError(400, "Não foi encontrado nada, impossível deletar")

        await User.findByIdAndDelete({ _id: id });

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
        const result = await User.findById({_id: id}).select("-password");
        if(!id || !result) throw new ApiError(400, "Nada foi encontrado, impossível atualizar");

        const validationData = userSchemaValidation.parse(req.body);
        await User.findByIdAndUpdate(id, { ...validationData }, {new: true});

        return res.status(200).json({message: "Usuário atualizado com sucesso"});
    }
    catch (e) {
        next(e);
    }
}