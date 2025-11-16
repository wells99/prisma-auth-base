import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import { userService } from "./user.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js"; 


const JWT_EXPIRATION = "1m";

const sanitizeUser = (user) => {
  if (!user) return null;
  const { user_password, user_deletedAt, ...safeUser } = user;
  return safeUser;
};

const generateToken = (user_uuid, user_email) => {
  const payload = { uuid: user_uuid, email: user_email };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRATION });
};

export const authService = {
  async register(userData) {
    const newUser = await userService.createUser(userData);
    const token = generateToken(newUser.user_uuid, newUser.user_email);

    return {
      user: sanitizeUser(newUser),
      token,
    };
  },

  async login(user_email, user_password) {
    const emailNormalized = user_email.toLowerCase();
    const user = await userRepository.findByEmail(emailNormalized);

    if (!user || user.user_deletedAt) throw new Error("Credenciais inválidas.");
    const passwordMatch = await bcrypt.compare(user_password, user.user_password);
    if (!passwordMatch) throw new Error("Credenciais inválidas.");

    const token = generateToken(user.user_uuid, user.user_email);

    // ✅ Log de login
    await logger.db(user.user_id, "LOGIN", "User", user.user_id, "Usuário autenticado");

    return {
      user: sanitizeUser(user),
      token,
    };
  },
};