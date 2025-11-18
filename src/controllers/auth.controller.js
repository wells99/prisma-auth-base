import { authService } from "../services/auth.service.js";
import { refreshTokenService } from "../services/refreshToken.service.js";
import { jwtUtil } from "../utils/jwt.js";
import { logger } from "../config/logger.js";

export const authController = {
    /**
     * Cadastro de novos usuários
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
     * Login
     * Gera Access Token + Refresh Token Opaco
     */
    async login(req, res) {
        try {
            const { user_email, user_password } = req.body;

            if (!user_email || !user_password) {
                return res.status(400).json({ message: "Email e senha são obrigatórios." });
            }

            // 1️⃣ Autentica usuário
            const result = await authService.login(user_email, user_password);
            const user = result.user;
            console.log(result)

            // 2️⃣ Gera Access Token JWT (curto)
            const accessToken = jwtUtil.generateAccessToken({ uuid: user.user_uuid });

            // 3️⃣ Gera Refresh Token Opaco (banco)
            const refreshToken = await refreshTokenService.generate(user.user_id);

            // 4️⃣ Armazena tokens nos cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge:  60 * 1000, // 1 Minuto
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 4 * 60 * 60 * 1000, // 4 horas
            });

            return res.status(200).json({
                message: "Login efetuado com sucesso.",
                user,
            });

        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    },

    /**
     * Refresh Token
     * Verifica refresh opaco, rotaciona e gera novo accessToken
     */
    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies;
          
            logger.info("EM  refresh -> ",refreshToken);
            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token não encontrado." });
            }
            
            // 1️⃣ Verifica refresh token no banco
            const user = await refreshTokenService.verify(refreshToken);
            
            // 2️⃣ Rota de segurança:
            //    Rotaciona → apaga o refresh antigo e cria um novo
            
            const newRefreshToken = await refreshTokenService.generate(user.user_id);
            console.log("EM  refresh -> ",newRefreshToken)
             logger.info("Novo refresh criado -> ",refreshToken);

            // 3️⃣ Gera novo access token
            const newAccessToken = jwtUtil.generateAccessToken({
                uuid: user.user_uuid
            });

            console.log("newAccessToken--rotacionado: ",newAccessToken)
              logger.info("Novo newAccessToken criado -> ",newAccessToken);
            // 4️⃣ Atualiza cookies
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge:  60 * 1000,
            });

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 4 * 60 * 60 * 1000,
            });

            return res.status(200).json({
                message: "Token renovado com sucesso."
            });

        } catch (error) {
            return res.status(403).json({ message: "Refresh token inválido ou expirado." });
        }
    },

    /**
     * Logout
     * Revoga todos os refresh tokens do usuário
     */
    async logout(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (refreshToken) {
                // tenta descobrir quem é o dono
                try {
                    const user = await refreshTokenService.verify(refreshToken);
                    await refreshTokenService.revokeUserTokens(user.user_id);
                } catch {
                    /* ignore erro — token já expirou ou é inválido */
                }
            }

            // limpa cookies
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return res.status(200).json({ message: "Logout realizado com sucesso." });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
};
