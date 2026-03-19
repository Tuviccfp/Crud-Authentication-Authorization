import { Router } from "express";
import {
    deleteById,
    getProductById,
    getProducts,
    getProductsReducer,
    newProduct,
    updatedById
} from "../controllers/product.controller";
import {authenticated, restrictAdmin, restrictEmployeer} from "../middleware";
const router = Router();

router.post("/create", authenticated, restrictAdmin, newProduct);

router.get("/list", getProductsReducer);

router.get("/list/:id", getProductById);

router.delete("/delete/:id", authenticated, restrictAdmin, deleteById);

router.put("/update/:id", authenticated, restrictAdmin, updatedById);

export default router;