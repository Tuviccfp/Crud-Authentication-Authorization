import jwt, {JwtPayload} from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";
import { Types } from 'mongoose'
import log from "../logger";

if(!process.env.JWT_SECRET) throw new Error(
    "Please, set the JWT_SECRET environment variable"
);

const JWT_SECRET: string = process.env.JWT_SECRET;

interface JWTCustomPayload extends JwtPayload {
    _id: string | Types.ObjectId;
    role: string;
}

export function jwtSign(payload: { _id: Types.ObjectId, role: string | undefined }): string {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
}

export function authenticated(req: Request, res: Response, next: NextFunction) {
        const authHeader: string | undefined = req.headers.authorization;
        if(!authHeader?.startsWith("Bearer ") || !authHeader) {
            log.info({token: authHeader}, "Invalid token, acess negative");
            return res.status(401).send("Invalid token, acess negative")
        }
        const token: string = authHeader.split(" ")[1];
    try {
        const decoded: string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string, role: string };
        if(!decoded) {
            log.info({token: token}, "Invalid token");
            return res.status(401).send("Invalid token");
        }
        log.info({token: token}, "Token valido");
        req.user = { _id: decoded._id, role: decoded.role }
        next();
    } catch (e) {
        log.info({e: e}, "Não é possível processar o token");
        return res.status(401).json({
            message: "Erro ao autenticar na aplicação"
        });
    }
}
export function  validRole(req: Request, res: Response, next: NextFunction) {
    if(req.user?.role !== "admin" && req.user?.role !== "premium") return res.status(401).json({
        message: "Acesso negado"
    });
    next();
}