import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const refreshTokenRepository = {
  async create({ token, userId, expiresAt }) {
    return await prisma.refreshToken.create({
      data: {
        token,
        token_userId: userId,
        token_expiresAt: expiresAt,
      },
    });
  },

  async findByToken(token) {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async delete(token) {
    return await prisma.refreshToken.delete({
      where: { token },
    });
  },

  async deleteByUserId(userId) {
    return await prisma.refreshToken.deleteMany({
      where: { token_userId: userId },
    });
  },
};
