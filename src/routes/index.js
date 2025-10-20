// src/routes/index.js

import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js"; 

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes); 

export default router;
