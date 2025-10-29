🧩 Prisma Auth Base

Este projeto define uma base sólida e escalável para backends em Node.js, construída com Express, Prisma ORM e JWT.
Focado em segurança e padronização, incorpora práticas de mercado como gerenciamento de sessão via Refresh Token, cookies HTTP-only, limitação de requisições e camadas bem definidas.
É um ponto de partida eficiente para aplicações que exigem autenticação robusta e arquitetura profissional.

🚀 Tecnologias Principais
Tecnologia	Descrição
Node.js	Ambiente de execução JavaScript no servidor
Express.js	Framework minimalista para construção de APIs REST
Prisma ORM	ORM moderno e tipado para integração com banco de dados
JWT (jsonwebtoken)	Autenticação via token seguro e assinado
Bcrypt	Criptografia de senhas com salt
Cookie-Parser	Manipulação de cookies HTTP-only
Helmet	Middleware de segurança HTTP
Express-Rate-Limit	Limitação de requisições para prevenção de ataques
UUID	Geração de identificadores únicos
Morgan	Logger de requisições HTTP
dotenv-safe	Gerenciamento de variáveis de ambiente com verificação de segurança
🏗️ Estrutura do Projeto
PRISMA-AUTH-BASE/
│
├── prisma/
│   └── schema.prisma        # Definição do modelo de dados do Prisma
│
├── src/
│   ├── config/              # Configurações gerais do projeto
│   │   ├── env.js           # Carrega variáveis de ambiente com validação
│   │   └── logger.js        # Configuração do logger (morgan)
│   │
│   ├── controllers/         # Camada de controle (recebe e envia respostas)
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   │
│   ├── middlewares/         # Middlewares globais e de autenticação
│   │   ├── auth.middleware.js
│   │   └── rateLimit.middleware.js
│   │
│   ├── repositories/        # Comunicação direta com o banco via Prisma
│   │   ├── auth.repository.js
│   │   └── user.repository.js
│   │
│   ├── routes/              # Definição das rotas da aplicação
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── health.routes.js
│   │   └── index.js
│   │
│   ├── services/            # Lógica de negócio (camada de serviço)
│   │   ├── auth.service.js
│   │   ├── refreshToken.service.js
│   │   ├── user.service.js
│   │   └── log.service.js
│   │
│   ├── utils/               # Funções auxiliares e utilitárias
│   │   ├── jwt.js           # Geração e validação de tokens
│   │   └── errors.js        # Tratamento e padronização de erros
│   │
│   ├── app.js               # Inicialização do Express e middlewares
│   └── server.js            # Ponto de entrada da aplicação
│
├── .env.example             # Exemplo de variáveis de ambiente
├── package.json
├── README.md
└── .gitignore

⚙️ Configuração do Ambiente
1️⃣ Clonar o repositório
git clone https://github.com/wells99/prisma-auth-base.git
cd prisma-auth-base

2️⃣ Instalar as dependências
npm install

3️⃣ Configurar variáveis de ambiente

Crie um arquivo .env baseado no .env.example:

cp .env.example .env


Edite os valores conforme seu ambiente local:

DATABASE_URL="mysql://user:password@localhost:3306/meubanco"
JWT_SECRET="sua_chave_secreta"
PORT=3000

4️⃣ Executar as migrações Prisma
npx prisma migrate dev

5️⃣ Iniciar o servidor
npm run dev


O servidor será executado em http://localhost:3000

🔐 Fluxo de Autenticação

Login: o usuário envia credenciais para /api/auth/login

Access Token e Refresh Token são gerados:

accessToken → curto prazo (ex: 15min)

refreshToken → longo prazo, armazenado no banco e enviado via cookie HTTP-only

Rotas protegidas: o middleware auth.middleware.js valida o JWT

Refresh: se o token expirar, o cliente pode requisitar um novo par via /api/auth/refresh

🧠 Padrões e Boas Práticas

✅ Arquitetura em camadas (Controller → Service → Repository)

✅ Separação de responsabilidades

✅ Tratamento centralizado de erros

✅ Uso de cookies HTTP-only para maior segurança

✅ Env Safe Validation (garante que variáveis obrigatórias existam)

✅ Rate Limiting e Helmet aplicados globalmente

✅ Logger estruturado via Morgan

🧪 Scripts úteis
Script	Descrição
npm run dev	Inicia o servidor com Nodemon
npm run start	Inicia o servidor em produção
npm run prisma:migrate	Executa migrações do Prisma
npm run prisma:generate	Gera o client do Prisma
📘 Endpoints Principais
Método	Rota	Descrição
POST	/api/auth/register	Cria um novo usuário
POST	/api/auth/login	Realiza login e gera tokens
POST	/api/auth/refresh	Gera novo access token
GET	/api/users	Lista usuários (rota protegida)
GET	/api/health	Verifica o status da API
🧰 Próximos Passos (Roadmap)

 Adicionar testes automatizados com Jest

 Documentar a API com Swagger

 Suporte a múltiplos bancos (PostgreSQL, MySQL, SQLite)

 Dockerização do ambiente

🤝 Contribuição

Contribuições são bem-vindas!
Abra uma issue ou envie um pull request para melhorias no projeto.

📄 Licença

Distribuído sob a licença ISC.
Consulte o arquivo LICENSE
 para mais detalhes.

🌐 Repositório

🔗 https://github.com/wells99/prisma-auth-base