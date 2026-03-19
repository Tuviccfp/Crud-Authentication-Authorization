import {NextFunction, Request, Response} from "express";
import {Product} from "../models/product";
import log from "../logger";
import {Types} from "mongoose";
import { productSchemaValidation} from "../models/product";
import {ApiError} from "../utils/ApiError";
import {ZodError} from "zod";

export const newProduct = async (req: Request, res: Response, next: NextFunction) => {
    const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
    try {
        const validatedProduct = productSchemaValidation.parse(req.body);
        await Product.create({
            ...validatedProduct,
            userCreate: user?._id,
        })

        log.info({name: validatedProduct.name, userCreate: user?._id}, "Produto cadastrado com sucesso!");
        return res.status(200).json({
            message: "Produto cadastrado com sucesso!"
        });
    } catch (e) {
        next(e);
    }
}

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await Product.find();
         
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
}
export const getProductsReducer = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const result = await Product.find({}).select("_id name price description image");
       if(!result) {
           log.warn("Nenhuma lista de produtos encontrados")
           throw new ApiError(404, "Nenhuma lista de produtos encontrados");
       }
       log.info("Lista de produtos encontrados");
       return res.status(200).json({
           message: "Lista de produtos encontrados",
           result: result
       });
    }
    catch (e) {
        next(e);
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        if(!id) {
            log.warn("Não foi possível realizar uma busca com o id capturado do parâmetro");
            return res.status(404).json({
                message: "Não é possível localizar nada com esse id"
            });
        }
        const result = await Product.findById({_id: id});
        log.info("Produto encontrado com sucesso");
        return res.status(200).json({
            message: "Produto encontrado",
            result: result
        });
    } catch (e) {
        next(e);
    }
}

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
        const {id} = req.params;
        //Mudar a lógica de deletar para alterar o campo de status para inativo, deletar o produto será responsabilidade do administrador
        if(!id) {
            log.warn("Não foi possível realizar uma busca pelo id");
            throw new ApiError(404, "Erro ao encontrar produto");
        }

        await Product.findByIdAndDelete({_id: id});
        log.info({user: user?._id}, "Produto deletado com sucesso");
        return res.status(200).json({
            message: "Produto deletado com sucesso"
        });
    } catch (e) {
        next(e);
    }
}

export const updatedById = async (req: Request, res: Response, next: NextFunction) => {
    const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
    try {
        const {id} = req.params;
        const result = await Product.findById({_id: id});

        if(!id || !result) {
            log.warn("Erro ao localizar o produto e efetuar a operação solicitada")
            throw new ApiError(404, "Não foi possível identificar o id do produto, operação não realizada");
        }

        const validationData = productSchemaValidation.parse(req.body);

        const product = new Product({
            ...validationData,
            userCreate: user?._id,
            updatedAt: new Date(),
        })

        await Product.findByIdAndUpdate(id, product, { new: true });

        log.info({user: user?._id},"Produto atualizado com sucesso");
        return res.status(200).json({
            message: "Produto atualizado com sucesso"
        })
    } catch (e) {
        next(e);
    }
}
