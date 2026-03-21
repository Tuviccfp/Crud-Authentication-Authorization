import { Router } from "express";
import {authenticated, restrictAdmin} from "../middleware";
import {deleteUserById, findUserById, profile, userUpdatedById} from "../controllers/user.controller";

const router = Router();

router.get("/profile", authenticated, profile);

router.get("/profile/:id", authenticated, findUserById);

router.put("/profile/updated/:id", authenticated, restrictAdmin, userUpdatedById);

router.get("/profile/delete/:id", authenticated, restrictAdmin, deleteUserById);

export default router