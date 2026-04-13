import { Router } from "express";
// import {
//     deleteById,
//     getProductById,
//     updatedById
// } from "../controllers/product.controller";
import {authenticated, restrictAdmin, restrictEmployeer} from "../middleware";
const router = Router();
import {productController} from "../controllers/product.controller";

router.post("/create", authenticated, restrictAdmin, productController.newProduct);
router.get("/list", productController.getProductsReducer);
router.get("/list-products-inativo", authenticated, restrictAdmin, productController.getProductsByStatusInativo);
router.get("/list-products", productController.getProductsByStatusAtivo);
router.get("/list/:id", productController.getProductById);
router.delete("/delete/:id", authenticated, restrictAdmin, productController.deleteById);
router.put("/update/:id", authenticated, restrictAdmin || restrictEmployeer, productController.updatedById);

export default router;
