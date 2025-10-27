import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { logger } from "../config/logger.js";

// Defina a regra de negócio centralizada para facilitar a manutenção
const MIN_PASSWORD_LENGTH = 10;
// Defina o número de rounds para o bcrypt. O valor '12' é um bom padrão
const BCRYPT_SALT_ROUNDS = 12;

// A função abaixo retorna true APENAS se tiver pelo menos DUAS letra E pelo menos UMA maiúscula.
function validatePasswordCharacterRules(password) {
    // Busca por dois caracteres de letra ([a-zA-Z]), em qualquer lugar (.*) na string.
    const hasAtLeastTwoLetters = /([a-zA-Z].*){2}/.test(password);
    // Busca por ao menos uma letra maiúscula.
    const hasUpperCase = /[A-Z]/.test(password);

    return hasAtLeastTwoLetters && hasUpperCase;
}

function sanitizeUser(user) {
    if (!user) return null;
    const { user_password, user_deletedAt, user_id, ...safeUser } = user;
    return safeUser;
}


export const userService = {
    // Criar novo usuário
    async createUser(userData) {

        if (!userData.user_email || !userData.user_password || !userData.user_name) {
            throw new Error('Email, senha e nome são obrigatórios.');
        }

        const { user_email, user_password, user_name, user_role } = userData;

        // VALIDAÇÃO DO TAMANHO DA SENHA (Lógica de Negócio)
        if (!user_password || user_password.length < MIN_PASSWORD_LENGTH) {
            throw new Error(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
        }

        if (user_password.length > 72) {
            throw new Error(`A senha não pode exceder 72 caracteres.`);
        }

        // VALIDAÇÃO DE SENHA CARACTERES (Lógica de Negócio)
        if (!validatePasswordCharacterRules(user_password)) {
            throw new Error('A senha deve conter pelo menos duas letras, e ao menos uma delas deve ser maiúscula.');
        }

        const existingUser = await userRepository.findByEmail(user_email);
        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(user_password, BCRYPT_SALT_ROUNDS);

        const newUser = await userRepository.createUser({
            user_email,
            user_password: hashedPassword,
            user_name,
            user_role: user_role || 'user',
        });
        // ✅ Log da criação de usuário
        await logger.db(newUser.user_id, "CREATE", "User", newUser.user_id, "Usuário registrado");

        return sanitizeUser(newUser);
    },

    // Listar todos os usuários ativos
    async listUsers() {
        const usersList = await userRepository.listUsers();
        return usersList.map(sanitizeUser);
    },

    // Buscar usuário pelo UUID
    async getUserByUuid(user_uuid) {
        const user = await userRepository.findById(user_uuid);
        if (!user || user.user_deletedAt) {
            throw new Error("Usuário não encontrado");
        }


        return sanitizeUser(user);
    },

    // Atualizar dados do usuário
    async updateUser(user_uuid, updateUserData) {
        if (!updateUserData || Object.keys(updateUserData).length === 0) {
            throw new Error("Nenhum dado fornecido para atualização.");
        }

        const user = await userRepository.findById(user_uuid);
        if (!user || user.user_deletedAt) {
            throw new Error("Usuário não encontrado");
        }


        // Criptografar nova senha, se enviada
        if (updateUserData.user_password) {
            const newPassword = updateUserData.user_password;

            // AQUI ESTÁ O AJUSTE E A CORREÇÃO DE VARIÁVEL

            // VALIDAÇÃO DO TAMANHO DA SENHA (Lógica de Negócio)
            if (newPassword.length < MIN_PASSWORD_LENGTH) {
                throw new Error(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
            }

            if (newPassword.length > 72) {
                throw new Error(`A senha não pode exceder 72 caracteres.`);
            }

            // VALIDAÇÃO DE SENHA CARACTERES (Lógica de Negócio)
            if (!validatePasswordCharacterRules(newPassword)) {
                throw new Error('A senha deve conter pelo menos duas letras, e ao menos uma delas deve ser maiúscula.');
            }

            // Criptografa a nova senha e a insere no objeto de atualização
            updateUserData.user_password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        }

        const updatedUser = await userRepository.updateUser(user_uuid, updateUserData)
        // ✅ Log da Edição do usuário
        await logger.db(updatedUser.user_id, "UPDATE", "User", updatedUser.user_id, "Usuário atualizado");
        return sanitizeUser(updatedUser);
    },

    // Soft delete (marcar como deletado)
    async deleteUser(user_uuid) {
        if (!user_uuid) {
            throw new Error("Confira as informaçoes do usuário.");
        }

        const user = await userRepository.findById(user_uuid);
        if (!user || user.user_deletedAt) {
            throw new Error("Usuário não encontrado ou já deletado.");
        }
        const deletedUser = await userRepository.softDeleteUser(user_uuid);
        // ✅ Log da deleção do usuário
        await logger.db(deletedUser.user_id, "DELETE", "User", deletedUser.user_id, "Usuário excluído");
        return sanitizeUser(deletedUser);
    },
};