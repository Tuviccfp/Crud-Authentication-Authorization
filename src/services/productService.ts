import { productSchemaValidation } from "@projeto/shared/schemas/product"
import { ProductDocument } from "@projeto/shared/interfaces/product"
import {Types} from "mongoose";
import {Product} from "../models/product";
import { z } from "zod";
import log from "../logger";
import {ApiError} from "../utils/ApiError";

const reuseCaseNullID = (id: string | Types.ObjectId | undefined) => {
    if (!id) {
        log.warn("Não foi possível realizar uma busca com o id capturado do parâmetro");
        return new ApiError(404, "Não é possível localizar nada com esse id");
    }
}

export const productService = {
    async createProduct(
        product: z.infer<typeof productSchemaValidation>,
        user: string | Types.ObjectId | undefined): Promise<ProductDocument> {
            return await Product.create({
                ...(product as Record<string, any>),
                userCreate: user,
            });
    },

    async getProductsByQuery(status: string, name: string): Promise<ProductDocument[] | null> {
        const filter: any = {status: status ? status : "ativo"};
        if(name) {
            filter.name = {$regex: name, $options: "i"};
        }
        console.log(filter);
        const result = await Product.find(filter).select("_id name price description image");
        if(result.length === 0) {
            log.warn("Nenhuma lista de produtos encontrados")
            throw new ApiError(404, "Nenhuma lista de produtos encontrados");
        }
        return Product.find(filter).select("_id name price description image");
    },

    async getProductById(id: string): Promise<ProductDocument | null> {
        reuseCaseNullID(id);
        return Product.findById(id);
    },

    async deleteProductById(id: string): Promise<void | null> {
        reuseCaseNullID(id);
        return Product.findByIdAndDelete(id);
    },

    async updateProductById(
        id: string,
        product: z.infer<typeof productSchemaValidation>,
        user: string | Types.ObjectId | undefined
    ): Promise<ProductDocument | null> {
        reuseCaseNullID(id)
        return Product.findByIdAndUpdate(id, {
            ...(product as Record<string, any>),
            userCreate: user
        });
    }
}
