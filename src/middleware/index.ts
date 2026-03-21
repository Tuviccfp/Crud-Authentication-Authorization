import jwt, {JwtPayload} from 'jsonwebtoken';
import {CookieOptions, NextFunction, Request, Response} from "express";
import { Types } from 'mongoose'
import log from "../logger";
import {ZodError} from "zod";
import {ApiError} from "../utils/ApiError";

if(!process.env.JWT_SECRET) throw new Error(
    "Please, set the JWT_SECRET environment variable"
);

const JWT_SECRET: string = process.env.JWT_SECRET;

interface JWTCustomPayload extends JwtPayload {
    _id: string | Types.ObjectId;
    role: string | undefined;
}

export function jwtSign(payload: JWTCustomPayload): string {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '1d'});
}

export function authenticated(req: Request, res: Response, next: NextFunction) {
        let token: string | undefined
        const headerAuth = req.headers.authorization;

        if(headerAuth && headerAuth.startsWith("Bearer ")) {
            token = headerAuth.split(" ")[1];
        }

        if(!token && req.cookies) {
            token = req.cookies.authToken;
        }
        if(!token) {
            log.info({token: token}, "Invalid token");
            return res.status(401).send("Invalid token");
        }
    try {
        const decoded: string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string, role: string };

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

export function  restrictAdmin(req: Request, res: Response, next: NextFunction) {
    if(req.user?.role !== "admin") return res.status(401).json({
        message: "Acesso negado"
    });
    next();
}
export function restrictEmployeer(req: Request, res: Response, next: NextFunction) {
    if(req.user?.role !== "employeer") return res.status(401).json({
        message: "Acesso negado"
    });
    next();
}

export function middlewareError(err: Error, req: Request, res: Response, next: NextFunction) {
    if(err instanceof ZodError) {
        log.warn({e: err}, "Erro ao validar dados");
        return res.status(400).json({
            message: "Erro ao validar dados",
            errors: err.issues.map((e) => e.message),
        });
    }

    if(err instanceof ApiError) {
        log.warn({e: err}, "Erro ao validar dados, insira-os novamente");
        return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({
        message: "Erro interno no servidor",
    })
}

export function cookieToken(res: Response, userRole: string | undefined, userId: Types.ObjectId | string) {
    const payload = {
        _id: userId,
        role: userRole
    }
    const optionsCookie: CookieOptions = {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    }
    const token: string = jwtSign(payload);
    return res.cookie("authToken", token, optionsCookie);
}