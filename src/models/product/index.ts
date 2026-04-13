import mongoose, {Schema} from "mongoose";
import { ProductDocument } from "@projeto/shared/interfaces/product"

const productSchema = new Schema<ProductDocument>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: { type: String, required: true, enum: ["ativo", "inativo"], default: "ativo" }
}, { timestamps: true });

export const Product =  mongoose.model<ProductDocument>("Product", productSchema);
