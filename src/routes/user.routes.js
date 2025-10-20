// src/routes/user.routes.js
import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const router = Router();

// 🧠 CRUD de usuários
router.post("/users", userController.createUser);   // Criar novo usuário
router.get("/users", userController.listUsers);     // Listar usuários
router.get("/users/:uuid", userController.getUserByUuid); // Buscar por UUID
router.put("/users/:uuid", userController.updateUser);    // Atualizar usuário
router.delete("/users/:uuid", userController.deleteUser); // Soft delete

export default router;
