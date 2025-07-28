import mongoose, {Schema, Document, Types} from "mongoose";

export interface Product extends Document {
    name: string;
    price: number;
    description: string;
    image: string;
    userCreate?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<Product>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Product =  mongoose.model<Product>("Product", productSchema);