import { jwtUtil } from "../utils/jwt.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Pega accessToken do cookie OU do header Authorization
    const token =
      req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Token de autenticação não fornecido" });
    }

    try {
      // Valida o accessToken (expira rápido, 1 minuto)
      const decoded = jwtUtil.verifyToken(token);

      req.user = {
        id: decoded.id,      // <-- Ajustado ao formato atual do JWT
        email: decoded.email,
        role: decoded.role,
      };

      return next();
    } catch (error) {
      // Token expirado ou inválido → impede acesso
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return res.status(500).json({ error: "Erro interno na autenticação" });
  }
};

export { authMiddleware };
