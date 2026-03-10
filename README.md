# BeTalent Multi-Gateway Payment API

API RESTful para gerenciamento de pagamentos multi-gateway com fallback automático e cálculo de valores no back-end.

---

## Requisitos

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Node.js (v18+)
- npm

---

## Variáveis de Ambiente

Crie o arquivo .env a partir do exemplo:
  cp .env.example .env

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| **Aplicação** | | |
| PORT | Porta da API | 3333 |
| APP_KEY | Chave da aplicação | cJCfwVWJC-oa5w0YtzIwPHlBh23pov-l |
| **Banco de Dados** | | |
| DB_CONNECTION | Driver de conexão | mysql |
| MYSQL_HOST | Host do MySQL | mysql |
| MYSQL_PORT | Porta do MySQL | 3306 |
| MYSQL_USER | Usuário do banco | betalent |
| MYSQL_PASSWORD | Senha do banco | betalent |
| MYSQL_DB_NAME | Nome do banco | betalent |
| **Gateway 1** | | |
| GATEWAY_1_URL | URL do mock G1 | http://gateways:3001 |
| GATEWAY_1_EMAIL | Email de auth G1 | dev@betalent.tech |
| GATEWAY_1_TOKEN | Token de auth G1 | FEC9BB078BF338F464F96B48089EB498 |
| **Gateway 2** | | |
| GATEWAY_2_URL | URL do mock G2 | http://gateways:3002 |
| GATEWAY_2_TOKEN | Token fixo G2 | tk_f2198cc671b5289fa856 |
| GATEWAY_2_SECRET | Secret fixo G2 | 3d15e8ed6131446ea7e3456728b1211f |

---

## Instalação e Execução

### Com Docker (recomendado)

1. Clonar o repositório
2. Copiar o .env: `cp .env.example .env`
3. Subir os containers: `docker-compose up -d --build`
4. Rodar as migrations: `docker exec betalent_api node ace migration:run`
5. Rodar as seeds: `docker exec betalent_api node ace db:seed`
6. URL de acesso da API: http://localhost:3333

### Sem Docker (ambiente local)

1. Clonar o repositório
2. Instalar dependências: `npm install`
3. Copiar o .env: `cp .env.example .env` (ajuste MYSQL_HOST para localhost)
4. Subir apenas banco e mocks: `docker-compose up -d mysql gateways`
5. Rodar as migrations: `node ace migration:run`
6. Rodar as seeds: `node ace db:seed`
7. Iniciar a API: `npm run dev`

---

## Seeds — Dados Iniciais

| Seed | O que cria |
| :--- | :--- |
| MainSeeder | Executa todas as seeds na ordem correta |
| GatewaySeeder | Gateway 1 (prioridade 1) e Gateway 2 (prioridade 2), ambos ativos |
| UserSeeder | Usuário admin padrão para primeiro acesso |

AVISO: as seeds são obrigatórias. Sem elas nenhum gateway estará ativo e todas as tentativas de compra falharão.

Credenciais do admin criado pela seed:
- Email: admin@email.com
- Senha: 123456

---

## Rotas da API

### Autenticação
As rotas privadas exigem o uso do token JWT no header Authorization. O token deve ser enviado no formato Bearer {token}.

### Rotas Públicas

#### POST /login
Descrição: Autentica um usuário e retorna o token de acesso.
Autenticação: Não requerida

Body:
```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

Resposta:
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": { "id": 1, "email": "admin@email.com", "role": "admin" }
  }
}
```

#### POST /purchase
Descrição: Realiza uma compra calculando o valor no backend sem receber campo amount.
Autenticação: Não requerida

Body:
```json
{
  "client": {
    "name": "Tester",
    "email": "tester@email.com"
  },
  "products": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "card": {
    "number": "5569000000006063",
    "cvv": "010"
  }
}
```

Resposta:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "paid",
    "amount": 2000,
    "gateway_id": 1
  }
}
```

### Rotas Privadas

Header obrigatório em todas:
Authorization: Bearer {token}

#### Gateways

- PATCH /gateways/:id/toggle
Descrição: Ativa ou desativa um gateway de pagamento.
Autenticação: Admin
Body: `{"isActive": boolean}`
Resposta: Sucesso com dados do gateway.

- PATCH /gateways/:id/priority
Descrição: Altera a prioridade de fallback do gateway.
Autenticação: Admin
Body: `{"priority": number}`
Resposta: Sucesso com dados do gateway.

#### Usuários

- GET /users
Descrição: Lista todos os usuários cadastrados.
Autenticação: Admin
Resposta: Lista de usuários.

- POST /users
Descrição: Cria um novo usuário administrativamente.
Autenticação: Admin
Body: `{"email": "...", "password": "...", "role": "..."}`
Resposta: Usuário criado.

- PUT /users/:id
Descrição: Atualiza dados de um usuário existente.
Autenticação: Admin
Body: `{"email": "...", "role": "..."}`
Resposta: Usuário atualizado.

- DELETE /users/:id
Descrição: Remove um usuário do sistema.
Autenticação: Admin
Resposta: Mensagem de exclusão.

#### Produtos

- GET /products
Descrição: Lista todos os produtos disponíveis.
Autenticação: Admin
Resposta: Lista de produtos.

- POST /products
Descrição: Cadastra um novo produto.
Autenticação: Admin
Body: `{"name": "...", "amount": 1000}`
Resposta: Produto criado.

- PUT /products/:id
Descrição: Atualiza dados de um produto.
Autenticação: Admin
Body: `{"name": "...", "amount": 1200}`
Resposta: Produto atualizado.

- DELETE /products/:id
Descrição: Remove um produto do catálogo.
Autenticação: Admin
Resposta: Mensagem de exclusão.

#### Clientes

- GET /clients
Descrição: Lista todos os clientes que já realizaram compras.
Autenticação: Admin
Resposta: Lista de clientes.

- GET /clients/:id
Descrição: Exibe detalhes do cliente e histórico de compras.
Autenticação: Admin
Resposta: Dados do cliente e transações relacionadas.

#### Transações

- GET /transactions
Descrição: Lista o histórico completo de transações da API.
Autenticação: Admin
Resposta: Lista de transações ordenadas por data.

- GET /transactions/:id
Descrição: Exibe detalhes completos de uma transação.
Autenticação: Admin
Resposta: Dados da transação com cliente, produtos e gateway.

- POST /transactions/:id/refund
Descrição: Realiza o estorno de uma transação processada.
Autenticação: Admin
Resposta: Transação com status atualizado para refunded.

---

## Testes

Comando para rodar os testes:
  node ace test

O que é testado:
- Fluxo de login
- Fluxo de compra com Gateway 1
- Fallback para Gateway 2 quando Gateway 1 falha
- Reembolso
