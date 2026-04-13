import {NextFunction, Request, Response} from "express";
import {Product} from "../models/product";
import log from "../logger";
import {Types} from "mongoose";
import { productSchemaValidation } from "@projeto/shared/schemas/product";
import {ApiError} from "../utils/ApiError";
import {productService} from "../services/productService";


export const productController = {
    async newProduct(req: Request, res: Response, next: NextFunction) {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
        try {
            const validatedProduct = productSchemaValidation.parse(req.body);
            await productService.createProduct(validatedProduct, user?._id);

            log.info({name: validatedProduct.name, userCreate: user?._id}, "Produto cadastrado com sucesso!");
            return res.status(201).json({
                message: "Produto cadastrado com sucesso!"
            });
        } catch (e) {
            next(e);
        }
    },

    async getProductsByStatusAtivo(req: Request, res: Response, next: NextFunction) {
    //Essa função abaixo vai sair
        try {
            const result = await Product.find({status: "ativo"});

            if(!result) {
                log.warn("Nenhuma lista de produtos encontrados")
                throw new ApiError(404, "Nenhuma lista de produtos encontrados");
            }

            log.info("Lista de produtos encontrados");
            return res.status(200).json({
                message: "Lista de produtos encontrados",
                result: result
            });
        } catch (e) {
            next(e);
        }
    },

    async getProductsReducer(req: Request, res: Response, next: NextFunction) {
        try {
            const {name, status} = req.query;
            const result = await productService.getProductsByQuery(status as string, name as string);
            log.info("Lista de produtos encontrados");
            return res.status(200).json({
                message: "Lista de produtos encontrados",
                result: result
            });
        }
        catch (e) {
            next(e);
        }
    },

    //Essa função abaixo vai sair
    async getProductsByStatusInativo(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await Product.find({status: "inativo"}).sort({updatedById: -1});
            if(!result) {
                log.warn("Nenhuma lista de produtos encontrados")
                throw new ApiError(404, "Nenhuma lista de produtos encontrados");
            }
            log.info("Lista de produtos encontrados");
            return res.status(200).json({
                message: "Lista de produtos encontrados",
                result: result
            });
        } catch (e) {
            next(e);
        }
    },

    async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            await productService.getProductById(id.toString());
            const result = await Product.findById({_id: id});
            log.info("Produto encontrado com sucesso");
            return res.status(200).json({
                message: "Produto encontrado",
                result: result
            });
        } catch (e) {
            next(e);
        }
    },

    async deleteById(req: Request, res: Response, next: NextFunction) {
        try {
            const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
            const {id} = req.params;
            await productService.deleteProductById(id.toString());

            log.info({user: user?._id}, "Produto deletado com sucesso");
            return res.status(200).json({
                message: "Produto deletado com sucesso"
            });
        } catch (e) {
            next(e);
        }
    },

    async updatedById(req: Request, res: Response, next: NextFunction) {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
        try {
            const {id} = req.params;
            const validationData = productSchemaValidation.parse(req.body);

            await productService.updateProductById(id.toString(), validationData, user?._id);

            log.info({user: user?._id},"Produto atualizado com sucesso");
            return res.status(200).json({
                message: "Produto atualizado com sucesso"
            })
        } catch (e) {
            next(e);
        }
    }
}
