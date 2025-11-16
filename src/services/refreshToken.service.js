import crypto from "crypto";
import jwt from "jsonwebtoken";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { env } from "../config/env.js";

const MAX_SESSION_MS = 4 * 60 * 60 * 1000; // 4 horas

export const refreshTokenService = {

  // Gera novo refresh token (agora com createdAt)
  async generate(userId) {
    const token = crypto.randomBytes(40).toString("hex");

    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 dias

    await refreshTokenRepository.create({
      token,
      userId,
      createdAt: now,       // <-- ADICIONADO
      expiresAt,
    });

    return token;
  },

  // Valida o refresh token + limita a 4h totais
  async verify(token) {
    const storedToken = await refreshTokenRepository.findByToken(token);

    if (!storedToken) {
      throw new Error("Token inválido");
    }

    // Expiração normal (7 dias)
    if (storedToken.token_expiresAt < new Date()) {
      await refreshTokenRepository.delete(token);
      throw new Error("Token expirado");
    }

    // ❗ Expiração da sessão (no máximo 4h desde o primeiro login)
    const sessionAge = Date.now() - new Date(storedToken.token_createdAt).getTime();

    if (sessionAge > MAX_SESSION_MS) {
      await refreshTokenRepository.delete(token);
      throw new Error("Sessão expirada (limite de 4h)");
    }

    return storedToken;
  },

  // Gera novo access e ROTACIONA refresh
  async renewAccessToken(oldRefreshToken) {
    const stored = await this.verify(oldRefreshToken);
    const user = stored.user;
    if (!user) throw new Error("Usuário não encontrado");

    // Deleta token antigo
    await refreshTokenRepository.delete(oldRefreshToken);

    // 🔥 IMPORTANTE:
    // Novo refresh token precisa manter o MESMO createdAt original para respeitar o limite de 4h
    const newRefresh = crypto.randomBytes(40).toString("hex");

    await refreshTokenRepository.create({
      token: newRefresh,
      userId: user.user_id,
      createdAt: stored.token_createdAt,   // <-- MANTÉM A ORIGEM DO LOGIN
      expiresAt: new Date(Date.now() + 7 * 86400000),
    });

    const newAccessToken = jwt.sign(
      {
        id: user.user_id,
        email: user.user_email,
        role: user.user_role,
      },
      env.jwtSecret,
      { expiresIn: "1m" } // seu objetivo: accessToken curtíssimo
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefresh,
    };
  },

  async revokeUserTokens(userId) {
    await refreshTokenRepository.deleteByUserId(userId);
  },
};
