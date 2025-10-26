// src/middlewares/auth.middleware.js
import { jwtUtil } from "../utils/jwt.js";

export const authMiddleware = {
  verifyToken(req, res, next) {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Token não fornecido" });

      const decoded = jwtUtil.verifyToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  },
};
