import { Router } from "express";
import {authenticated} from "../middleware";
import {findUserById, profile} from "../controllers/user.controller";

const router = Router();

router.get("/profile", authenticated, profile);

router.get("/profile/:id", authenticated, findUserById);

export default router