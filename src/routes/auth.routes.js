import { Router } from "express";
// Importa o controller de autenticação
import { authController } from "../controllers/auth.controller.js";

const authRoutes = Router();

// Rota 1: Cadastro de Novo Usuário
// Chama o método 'register' do AuthController
authRoutes.post("/register", authController.register);

// Rota 2: Login de Usuário
// Chama o método 'login' do AuthController
authRoutes.post("/login", authController.login);

export default authRoutes;