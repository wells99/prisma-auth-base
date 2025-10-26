// src/utils/jwt.js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const JWT_EXPIRATION = "4h";
const REFRESH_EXPIRATION = "7d";

export const jwtUtil = {
  generateAccessToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRATION });
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: REFRESH_EXPIRATION });
  },

  verifyToken(token, isRefresh = false) {
    const secret = isRefresh ? env.jwtRefreshSecret : env.jwtSecret;
    return jwt.verify(token, secret);
  },
};
