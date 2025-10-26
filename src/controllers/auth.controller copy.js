import { authService } from "../services/auth.service.js";

export const authController = {
    /**
     * Controlador para o cadastro de novos usuários.
     * Delega a lógica de criação de usuário para o userService.createUser. */
    async register(req, res) {
        try {
            // Extrai dados do corpo da requisição.
            // O serviço de usuário já lida com o hashing e validações.
            const userData = req.body; 

            // Chama o serviço de autenticação/usuário para criar o usuário.
            // No momento estamos apenas criando o usuario mas essa arquitetura permite 
            // que adicionemos outras funções sem precisar mexer na função principal.
            const newUser = await authService.register(userData); 
            return res.status(201).json(newUser);

        } catch (error) {
            // Se houver erro de validação (ex: senha curta, email já existe)
            return res.status(400).json({ message: error.message });
        }
    },

    /**
     * Controlador para o login de usuários.
     * Delega a lógica de autenticação e geração de token para o AuthService.
     */
    async login(req, res) {
        try {
            const { user_email, user_password } = req.body;
            
            if (!user_email || !user_password) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
            }

            // Chama o serviço para autenticar e obter o token/usuário.
            const result = await authService.login(user_email, user_password);

            // Resposta de sucesso (status 200 OK)
            // O serviço retorna o token JWT e, opcionalmente, os dados do usuário.
            return res.status(200).json(result);

        } catch (error) {
            // Erro de autenticação (ex: senha incorreta, usuário não encontrado)
            // É padrão retornar 401 Unauthorized para falhas de login.
            return res.status(401).json({ message: error.message });
        }
    }
};