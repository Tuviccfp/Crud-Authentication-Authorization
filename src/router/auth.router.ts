import { Router } from "express";
import {authController} from "../controllers/auth.controller";
import {authenticated} from "../middleware";

const router = Router();

router.get("/teste", authController.helloMessage);

router.post("/register", authController.register);

router.post("/enter", authController.enter);

router.get("/logout/", authenticated, authController.logout);

export default router;