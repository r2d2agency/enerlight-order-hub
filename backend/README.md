# Enerlight API

## Configuração

1. Copie o `.env.example` para `.env` e preencha com seus dados:
```bash
cp .env.example .env
```

2. Instale as dependências:
```bash
npm install
```

3. Crie as tabelas no banco:
```bash
npm run db:migrate
```

4. Inicie o servidor:
```bash
npm start
# ou para desenvolvimento:
npm run dev
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3001` |
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/enerlight` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `sua-chave-secreta-aqui` |
| `CORS_ORIGIN` | URL do frontend | `https://seudominio.com` |

## Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Cadastro
- `GET /api/auth/me` — Usuário logado

### Products
- `GET /api/products` — Listar
- `POST /api/products` — Criar
- `PUT /api/products/:id` — Atualizar
- `DELETE /api/products/:id` — Remover

### Clients
- `GET /api/clients` — Listar
- `POST /api/clients` — Criar
- `PUT /api/clients/:id` — Atualizar
- `DELETE /api/clients/:id` — Remover

### Orders
- `GET /api/orders` — Listar
- `POST /api/orders` — Criar
- `PUT /api/orders/:id` — Atualizar

### Users (admin)
- `GET /api/users` — Listar
- `POST /api/users` — Criar
- `PUT /api/users/:id` — Atualizar
- `DELETE /api/users/:id` — Remover

## Deploy na Easypanel

1. Crie um serviço "App" na Easypanel
2. Configure o build: Dockerfile
3. Adicione as variáveis de ambiente
4. Deploy!
