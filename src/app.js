import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { logger } from "./config/logger.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import cookieParser from 'cookie-parser';


const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Ler cookies nas requisições

// Teste rápido de log manual
logger.info("Servidor iniciado com sucesso 🚀");

// Rotas
app.use("/api", router);

// Rate Limiter
app.use(globalLimiter);


// Middleware global de tratamento de erro
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.url}`);
  res.status(500).json({ message: "Erro interno do servidor." });
});

export default app;