import { Router } from "express";
import {authenticated} from "../middleware";
import {profile} from "../controllers/user.controller";

const router = Router();

router.get("/profile", authenticated, profile);

export default router