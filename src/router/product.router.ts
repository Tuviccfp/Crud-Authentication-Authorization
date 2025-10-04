import { Router } from "express";
import {deleteById, getProducts, newProduct, updatedById} from "../controllers/product.controller";
import {authenticated, validRole} from "../middleware";
const router = Router();

router.post("/create", authenticated, validRole ,newProduct);

router.get("/list", getProducts);

router.get("/list/:id", getProducts);

router.delete("/delete/:id", authenticated, validRole, deleteById);

router.put("/update/:id", authenticated, validRole, updatedById);

export default router;