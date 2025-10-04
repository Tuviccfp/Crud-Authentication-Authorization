import { Request, Response } from "express";
import {Product} from "../models/product";
import log from "../logger";
import {Types} from "mongoose";

export const newProduct = async (req: Request, res: Response) => {
    const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
    try {
        const {name, price, description, image} = req.body;
        if(!name || !price || !description || !image) {
            return res.status(400).json({
                message: "Não é permitido campos vazios"
            })
        }
        await Product.create({
            name,
            price,
            description,
            image,
            userCreate: user?._id,
        })
        log.info({name: name, userCreate: user?._id}, "Produto cadastrado com sucesso!");
        return res.status(200).json({
            message: "Produto cadastrado com sucesso!"
        });
    } catch (e) {
        log.info({e: e}, "Erro ao cadastrar produto");
    }
}

export const getProducts = async (req: Request, res: Response) => {
    try {
        const result = await Product.find();
        if(!result) {
            log.warn("Nenhuma lista de produtos encontrados")
            return res.status(200).json({
                message: "Nenhuma lista de produtos encontrados"
            })
        }
        log.info("Lista de produtos encontrados");
        return res.status(200).json({
            message: "Lista de produtos encontrados",
            result: result
        });
    } catch (e) {
        log.info({e: e}, "Erro ao buscar produtos");
        return res.status(500).json({
            message: "Erro interno no servidor"
        })
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const result = await Product.findById({_id: id});
        if(!result) {
            log.warn("Não foi possível realizar uma busca com o id capturado do parâmetro");
            return res.status(404).json({
                message: "Não é possível localizar nada com esse id"
            })
        }
        log.info("Produto encontrado com sucesso");
        return res.status(200).json({
            message: "Produto encontrado",
            result: result
        });
    } catch (e) {
        log.info({e: e}, "Erro ao  fazer a busca pelo produto");
        return res.status(500).json({
            message: "Erro interno no servidor"
        })
    }
}

export const deleteById = async (req: Request, res: Response) => {
    try {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;
        const {id} = req.params;
        const result = await Product.findByIdAndDelete({_id: id});

        if(!result) {
            log.warn("Não foi possível realizar uma busca pelo id e efetuar a operação delete");
            return res.status(404).json({
                message: "Erro ao deletar o produto, id não encontrado"
            })
        }
        log.info({user: user?._id}, "Produto deletado com sucesso");
        return res.status(200).json({
            message: "Produto deletado com sucesso"
        });
    } catch (e) {
        log.info({e: e}, "Erro ao deletar produto");
        return res.status(500).json({
            message: "Erro interno no servidor"
        })
    }
}

export const updatedById = async (req: Request, res: Response) => {
    try {
        const user: {_id: string | Types.ObjectId, role: string} | undefined = req.user;

        const {id} = req.params;
        const result = await Product.findByIdAndUpdate({_id: id});
        const {name, price, description, image} = req.body;

        if(!id && !result) {
            log.warn("Erro ao localizar o produto e efetuar a operação solicitada")
            return res.status(404).json({
                message: "Não foi possível identificar o id do produto, operação não realizada"
            })
        } else if(!name || !price || !description || !image) {
            log.warn("Campos em branco enviado pelo usuário");
            return res.status(400).json("Não é permitido campos vazios")
        }

        await Product.create({
            name,
            price,
            description,
            image,
            userCreate: user?._id,
            updatedAt: new Date(),
        });

        log.info({user: user?._id},"Produto atualizado com sucesso");
        return res.status(200).json({
            message: "Produto atualizado com sucesso"
        })
    } catch (e) {
        log.info({e: e}, "Erro ao atualizar produto");
        return res.status(500).json({
            message: "Erro interno no servidor"
        })
    }
}
