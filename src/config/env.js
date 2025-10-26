import { config } from 'dotenv'
config()

// Cria um objeto central com todas as variáveis que serão usadas no app
export const env = {
  port: process.env.PORT || 3333,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
}

// Valida se alguma variável essencial está ausente
if (!env.databaseUrl || !env.jwtSecret) {
  console.error('❌ Erro: variáveis de ambiente ausentes no arquivo .env')
  process.exit(1)
}
