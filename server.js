import { env } from './src/config/env.js'
import app from './src/app.js'

app.listen(env.port, () => {
  console.log(`\u2705 Servidor rodando na porta ${env.port}`)
})