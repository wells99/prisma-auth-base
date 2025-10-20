import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import { userService } from "./user.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { env } from "../config/env.js";

// --- Configurações JWT ---
const JWT_EXPIRATION = "4h";

/**
 * 🔒 Remove campos sensíveis do objeto usuário
 * Essa função é usada apenas aqui, já que no user.service
 * a sanitização já ocorre automaticamente.
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { user_password, user_deletedAt, ...safeUser } = user;
  return safeUser;
};

/**
 * 🔐 Gera o token JWT com base no UUID e email do usuário
 */
const generateToken = (user_uuid, user_email) => {
  const payload = { uuid: user_uuid, email: user_email };

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: JWT_EXPIRATION,
  });
};

// --- Serviço Principal de Autenticação ---
export const authService = {
  /**
   * 🧩 Registro de novo usuário
   * Usa o userService.createUser (já faz hash e validações)
   */
  async register(userData) {
    // Cria o novo usuário via service (já vem higienizado)
    const newUser = await userService.createUser(userData);

    // Cria o token baseado no UUID
    const token = generateToken(newUser.user_uuid, newUser.user_email);

    return {
      user: sanitizeUser(newUser),
      token,
    };
  },

  /**
   * 🔑 Login de usuário existente
   * Busca o hash no repository e compara manualmente com bcrypt
   */
  async login(user_email, user_password) {
    const emailNormalized = user_email.toLowerCase();

    // Busca direta no repository (precisamos do hash)
    const user = await userRepository.findByEmail(emailNormalized);

    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    // Verifica se o usuário está deletado logicamente
    if (user.user_deletedAt) {
      throw new Error("Usuário não encontrado");
    }

    // Compara senha informada com o hash salvo
    const passwordMatch = await bcrypt.compare(user_password, user.user_password);
    if (!passwordMatch) {
      throw new Error("Credenciais inválidas.");
    }

    // Gera o token JWT com UUID
    const token = generateToken(user.user_uuid, user.user_email);

    return {
      user: sanitizeUser(user),
      token,
    };
  },
};
