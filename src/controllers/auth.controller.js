import { authService } from "../services/auth.service.js";
import { jwtUtil } from "../utils/jwt.js";

export const authController = {
    /**
     * Controlador para o cadastro de novos usuários.
     * Delega a lógica de criação de usuário para o userService.createUser.
     */
    async register(req, res) {
        try {
            const userData = req.body;
            const newUser = await authService.register(userData);
            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    /**
     * Controlador para o login de usuários.
     * Autentica o usuário, gera tokens e define cookies seguros.
     */
    async login(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(400).json({ message: "Email e senha são obrigatórios." });
            }

            // Autentica usuário e obtém token + dados
            const result = await authService.login(user_email, user_password);

            // Cria refresh token adicional
            const refreshToken = jwtUtil.generateRefreshToken({ uuid: result.user.user_uuid });

            // Define cookies seguros
            res.cookie("accessToken", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 60 * 60 * 1000, // 1h
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
            });

            // Retorna dados do usuário
            return res.status(200).json(result);

        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    },

    /**
     * Controlador responsável por renovar o token de acesso.
     * Usa o refresh token armazenado nos cookies.
     */
    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token não encontrado." });
            }

            // Verifica validade do refresh token
            const decoded = jwtUtil.verifyToken(refreshToken, true);
            const newAccessToken = jwtUtil.generateAccessToken({ uuid: decoded.uuid });

            // Atualiza cookie de access token
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 4 * 60 * 60 * 1000,
            }); 

            return res.status(200).json({ message: "Token renovado com sucesso." });
        } catch (error) {
            return res.status(403).json({ message: "Refresh token inválido ou expirado." });
        }
    },
};