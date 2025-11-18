import crypto from "crypto";
import jwt from "jsonwebtoken";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { env } from "../config/env.js";

export const refreshTokenService = {
  // Gera novo refresh token com validade de 4 horas
  async generate(userId) {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 horas

    await refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    return token;
  },

  // Valida o refresh token (usa apenas token_expiresAt)
  async verify(token) {
    console.log("Verificando token: ", token)
    const storedToken = await refreshTokenRepository.findByToken(token);
    console.log("Token encontrado: ", storedToken)
    if (!storedToken) {
      throw new Error("Token inválido");
    }

    // Expiração da sessão (máximo definido pelo token_expiresAt)
    if (new Date(storedToken.token_expiresAt) < new Date()) {
      console.log("Token expirado: ", storedToken)
      throw new Error("Token expirado");
    }

    return storedToken;
  },

  // Gera novo access e ROTACIONA refresh, mantendo o mesmo expiresAt do token antigo
  async renewAccessToken(oldRefreshToken) {
    const stored = await this.verify(oldRefreshToken);
    const user = stored.user;
    if (!user) throw new Error("Usuário não encontrado");

    // Deleta token antigo
    console.log("Usuario encontrado: proximo passo deletar o token")

    console.log("Criando novo refreshToken mantendo a validade ")
    // Novo refresh token (mantém a validade original para limitar a sessão)
    const newRefresh = crypto.randomBytes(40).toString("hex");

    await refreshTokenRepository.create({
      token: newRefresh,
      userId: user.user_id,
      expiresAt: new Date(stored.token_expiresAt), // mantém o mesmo prazo
    });

    const newAccessToken = jwt.sign(
      {
        id: user.user_id,
        email: user.user_email,
        role: user.user_role,
      },
      env.jwtSecret,
      { expiresIn: "1m" } // accessToken curto
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefresh,
    };
  },

  async revokeUserTokens(userId) {
    console.log("função revokeUserTokens: ", userId)
    await refreshTokenRepository.deleteByUserId(userId);
  },
};
