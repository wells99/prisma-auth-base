// import { prisma } from "../config/prisma.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const logRepository = {
  async createLog(data) {
    return prisma.log.create({ data });
  }
};