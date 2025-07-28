import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";

export interface UserTypes {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface UserDocument extends UserTypes, Document {
    checkPassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "basic" },
});

userSchema.pre("save", async function (next): Promise<void> {
    if(!this.isModified("password")) return next();
    this.password =  await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
}

export const User = mongoose.model<UserDocument>("User", userSchema);

