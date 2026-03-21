import mongoose, {Schema, Document, Types, ObjectId} from "mongoose";
import {z, ZodType} from "zod";

const productSchemaValidation = z.object({
    name: z.string({
        message: "O nome é obrigatório"
    }).min(5, "É necessário ter no mínimo 5 caracteres").max(50, "Não pode ultrapassar 50 caracteres"),
    price: z.number({
        message: "Preço não pode ser vazio nem negativo"
    }).min(0, "O preço não pode ser negativo"),
    description: z.string().min(5, "É necessário ter no mínimo 5 caracteres").max(255, "Não pode ultrapassar 255 caracteres"),
    image: z.string().min(5, "").max(255, ""),
});

export interface ProductDocument extends Document {
    name: string;
    price: number;
    description: string;
    image: string;
    userCreate: Types.ObjectId;
}

const productSchema = new Schema<ProductDocument>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Product =  mongoose.model<ProductDocument>("Product", productSchema);
export { productSchemaValidation }