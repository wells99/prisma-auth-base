import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";

const authRoutes = Router();

// Rota 1: Cadastro de Novo Usuário
// Chama o método 'register' do AuthController
authRoutes.post("/register", authController.register);

// Rota 2: Login de Usuário
// Chama o método 'login' do AuthController
authRoutes.post("/login", authController.login);

// Rota 3: Refresh Token
authRoutes.post("/refresh", authController.refresh);


export default authRoutes;