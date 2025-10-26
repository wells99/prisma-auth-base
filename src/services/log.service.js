import { logRepository } from "../repositories/log.repository.js";

export const logService = {
  async create({ log_userId, log_action, log_table, log_recordId, log_description }) {
    return logRepository.createLog({
      log_userId,
      log_action,
      log_table,
      log_recordId,
      log_description
    });
  }
};
