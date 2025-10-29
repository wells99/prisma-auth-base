import { jwtUtil } from '../utils/jwt.js';

const authMiddleware = async (req, res, next) => {
  try {
    // tenta pegar do cookie ou do header Authorization
    const token =
      req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
      

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Token de autenticação não fornecido' });
    }

    try {
      const decoded = jwtUtil.verifyToken(token);

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno na autenticação' });
  }
};

export { authMiddleware };
