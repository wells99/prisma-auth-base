import winston from "winston";
import { logService } from "../services/log.service.js";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()]
});

// 🔧 Exemplo de integração com banco
logger.db = async (userId, action, table, recordId, description) => {
  try {
    await logService.create({
      log_userId: userId,
      log_action: action,
      log_table: table,
      log_recordId: recordId,
      log_description: description
    });
  } catch (err) {
    logger.error("Erro ao salvar log no banco: " + err.message);
  }
};

export { logger };
