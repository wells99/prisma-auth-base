import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const userRepository = {
    async createUser(userData) {
        return await prisma.user.create({ data: userData });
    },

    async listUsers() {
        return await prisma.user.findMany({
            where: { user_deletedAt: null },
            orderBy: { user_createdAt: 'desc' },
        });
    },

    async findByEmail(userEmail) {
        return await prisma.user.findUnique({
            where: { user_email: userEmail },
        });
    },

    async findById(userUuid) {
        return await prisma.user.findUnique({
            where: { user_uuid: userUuid },
        });
    },

    async updateUser(uuid, updateUserData) {
        return await prisma.user.update({
            where: { user_uuid: uuid },
            data: updateUserData,
        });
    },

    async softDeleteUser(uuid) {
        return await prisma.user.update({
            where: { user_uuid: uuid },
            data: { user_deletedAt: new Date() },
        });
    },
};
