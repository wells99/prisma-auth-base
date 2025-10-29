import { Router } from "express";
import { authMiddleware  } from "../middlewares/auth.middleware.js";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js"; 

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(authMiddleware,userRoutes);

export default router;