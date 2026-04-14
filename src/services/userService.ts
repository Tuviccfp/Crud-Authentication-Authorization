import { User } from "../models/user";
import {ApiError} from "../utils/ApiError";
import { Response, Request } from "express"
import {ObjectId} from "mongodb";
import log from "../logger";
import {Product} from "../models/product";
import { UserInterface } from "@projeto/shared/interfaces/user";
import jwt from "jsonwebtoken";
import {redis} from "../index";

export const userService = {

    async registerUser(user: UserInterface) {
        const existingUser = await User.findOne({ email: user.email });
        if(existingUser) throw new ApiError(409, "E-mail já em uso");
        return await User.create(user);
    },
    async enterUser(email: string, password: string) {
        const result = await User.findOne({ email: email });
        if(!result || !await result.checkPassword(password)) throw new ApiError(404, "E-mail ou senha inválidos");
        return { role: result.role, _id: result._id }
    },
    async findById(id: string | undefined | ObjectId) {
        return await User.findById(id).orFail(() => { throw new ApiError(404, "Não existe nada com esse id") }).select("-password");
    },
    async deleteUserById(id: string) {
        return await User.findByIdAndDelete(id).orFail(() => { throw new ApiError(404, "Não existe nada com esse id") });
    },
    async updatedById(id: string, user: UserInterface) {
        return await User.findByIdAndUpdate(id, user, {new: true})
            .orFail(() => { 
                throw new ApiError(404, "Não existe nada com esse id") 
            })
            .select("-password");
    },
    async listProductsByUserId(id: string) {
        if (!id) {
            log.error("A aplicação não conseguiu buscar nada com esse ID");
            throw new ApiError(400, "Não foi possível localizar o id");
        }
        const resultProducts = await Product.find({userCreate: id}).sort({createdAt: -1});
        if (!resultProducts.length) {
            log.error("Usuário sem nada cadastrado");
            throw new ApiError(404, "Não existe produto cadastrado no seu usuário");
        }
        return resultProducts;
    },

    async logout(req: Request) {
        let finalToken: string | undefined
        const setTokenHeader = req.headers.authorization?.split(' ')[1];
        const setTokenCookie = req.cookies.authToken;
        if(setTokenHeader) {
            finalToken = setTokenHeader
        }
        if(!finalToken && setTokenCookie) {
            finalToken = setTokenCookie
        }
        const decoded = jwt.decode(finalToken as string) as { exp: number };
        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - now;
        if(ttl > 0) {
            await redis.setex(`bl_$${finalToken}`, ttl, "true");
        }
    }
}