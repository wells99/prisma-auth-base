import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';

// Defina a regra de negócio centralizada para facilitar a manutenção
const MIN_PASSWORD_LENGTH = 10;

// A função abaixo true APENAS se tiver pelo menos DUAS letra E pelo menos UMA maiúscula.
function validatePasswordCharacterRules(password) {
    const hasAtLeastTwoLetters = /([a-zA-Z].*){2}/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);

    
    return hasAtLeastTwoLetters && hasUpperCase;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { user_password, user_deletedAt,user_id, ...safeUser } = user;
  return safeUser;
}


export const userService = {
  // Criar novo usuário
  async createUser(userData) {
    const { user_email, user_password, user_name, user_role } = userData;

    //VALIDAÇÃO DO TAMANHO DA SENHA (Lógica de Negócio)
    if (!user_password || user_password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    if (user_password.length > 72) {
      throw new Error(`A senha não pode exceder 72 caracteres.`);
    }

     //VALIDAÇÃO DE SENHA CARACTERES (Lógica de Negócio)
    if (!validatePasswordCharacterRules(user_password)) {
        throw new Error('A senha deve conter pelo menos duas letras, e ao menos uma delas deve ser maiúscula.');
    }

      const existingUser = await userRepository.findByEmail(user_email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(user_password, 12);

    const newUser = await userRepository.createUser({
      user_email,
      user_password: hashedPassword,
      user_name,
      user_role: user_role || 'user',
    });

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
    const user = await userRepository.findById(user_uuid);
    if (!user || user.user_deletedAt) {
      throw new Error("Usuário não encontrado");
    }


    // Criptografar nova senha, se enviada
    if (updateUserData.user_password) {
      updateUserData.user_password = await bcrypt.hash(updateUserData.user_password, 12);
    }
    const updatedUser = await userRepository.updateUser(user_uuid, updateUserData)
    return sanitizeUser(updatedUser);
  },

  // Soft delete (marcar como deletado)
  async deleteUser(user_uuid) {
    const user = await userRepository.findById(user_uuid);
    if (!user || user.user_deletedAt) {
      throw new Error("Usuário não encontrado ou já deletado.");
    }
    const deletedUser = await userRepository.softDeleteUser(user_uuid);
    return sanitizeUser(deletedUser);
  },
};
