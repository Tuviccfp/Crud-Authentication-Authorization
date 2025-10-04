import { Router } from "express";
import {enter, helloMessage, register} from "../controllers/auth.controlle";

const router = Router();

router.get("/teste", helloMessage);

router.post("/register", register);

router.post("/enter", enter);

export default router;