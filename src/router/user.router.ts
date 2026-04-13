import { Router } from "express";
import {authenticated, restrictAdmin} from "../middleware";
import {
    deleteUserById,
    findUserById,
    listProductsByUserId,
    profile, userController,
    userUpdatedById
} from "../controllers/user.controller";

const router = Router();

router.get("/profile", authenticated, userController.profile);

router.get("/profile/list-products-user", authenticated, userController.listProductsByUserId);

router.get("/profile/:id", authenticated, userController.findUserById);

router.get("/profile/view/:id", userController.findUserById);

router.put("/profile/updated/:id", authenticated, restrictAdmin, userController.userUpdatedById);

router.get("/profile/delete/:id", authenticated, restrictAdmin, userController.deleteUserById);

export default router