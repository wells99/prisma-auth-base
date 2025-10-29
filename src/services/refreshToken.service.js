import crypto from "crypto";
import jwt from "jsonwebtoken";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { env } from "../config/env.js";

export const refreshTokenService = {
  async generate(userId) {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // expira em 7 dias

    await refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    return token;
  },

  async verify(token) {
    const storedToken = await refreshTokenRepository.findByToken(token);
    if (!storedToken) throw new Error("Token inválido");
    if (storedToken.token_expiresAt < new Date()) throw new Error("Token expirado");

    return storedToken.user;
  },

  async renewAccessToken(refreshToken) {
    const user = await this.verify(refreshToken);
    const newAccessToken = jwt.sign(
      { id: user.user_id, email: user.user_email },
      env.jwtSecret,
      { expiresIn: "15m" }
    );

    return { accessToken: newAccessToken };
  },

  async revokeUserTokens(userId) {
    await refreshTokenRepository.deleteByUserId(userId);
  },
};
