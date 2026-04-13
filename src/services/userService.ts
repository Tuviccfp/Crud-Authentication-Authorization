import { User } from "../models/user";
import {ApiError} from "../utils/ApiError";
import { Response } from "express"
import {ObjectId} from "mongodb";
import log from "../logger";
import {Product} from "../models/product";
import { UserInterface } from "@projeto/shared/interfaces/user";
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

    async logout(res: Response) {
        return res.cookie("authToken", "", {
            httpOnly: true,
            expires: new Date(0),
        })
    }

}