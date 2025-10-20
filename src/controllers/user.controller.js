import { userService } from "../services/user.service.js";

export const userController = {
  
  async createUser(req, res) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(201).json({
        message: "Usuário criado com sucesso",
        data: newUser,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  
  async listUsers(req, res) {
    try {
      const users = await userService.listUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  
  async getUserByUuid(req, res) {
    try {
      const { uuid } = req.params;
      const user = await userService.getUserByUuid(uuid);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

   
  async updateUser(req, res) {
    try {
      const { uuid } = req.params;
      const updatedUser = await userService.updateUser(uuid, req.body);
      return res.status(200).json({
        message: "Usuário atualizado com sucesso",
        data: updatedUser,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  
  async deleteUser(req, res) {
    try {
      const { uuid } = req.params;
      const deletedUser = await userService.deleteUser(uuid);
      return res.status(200).json({
        message: "Usuário deletado (soft delete) com sucesso",
        data: deletedUser,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

