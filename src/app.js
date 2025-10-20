import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import router from "./routes/index.js";

const app = express()

// Middlewares globais
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Rotas da API
app.use("/api", router);

export default app
