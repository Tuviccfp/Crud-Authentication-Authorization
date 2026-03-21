import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";
import {z} from "zod";

export const userSchemaValidation = z.object({
    name: z.string().min(5, "O nome deve conter ao menos 5 caracteres").max(30, "O nome deve conter até 30 caracteres"),
    email: z.email("Email inválido"),
    password: z.string().min(8, "A senha deve conter ao menos 8 caracteres"),
    role: z.enum(["basic", "employeer", "admin"]).default("basic").optional(),
})

export type UserTypes = z.infer<typeof userSchemaValidation>;

export interface UserDocument extends UserTypes, Document {
    checkPassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["basic", "employeer", "admin"],default: "basic" }
}, { timestamps: true });

userSchema.pre("save", async function (next): Promise<void> {
    if(!this.isModified("password")) return next();
    this.password =  await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
}

export const User = mongoose.model<UserDocument>("User", userSchema);

