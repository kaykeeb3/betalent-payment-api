# BeTalent Multi-Gateway Payment API

API RESTful para gerenciamento de pagamentos multi-gateway com fallback automático e cálculo de valores no back-end.

---

## Requisitos

- Docker v20.10+
- Docker Compose v2.0+
- Node.js v18+
- npm

---

## Variáveis de Ambiente

Crie o arquivo .env a partir do exemplo:
cp .env.example .env

| Variável         | Descrição                            | Obrigatória |
| :--------------- | :----------------------------------- | :---------- |
| PORT             | Porta em que a API será executada    | Sim         |
| APP_KEY          | Chave secreta da aplicação           | Sim         |
| DB_CONNECTION    | Driver de conexão do banco de dados  | Sim         |
| MYSQL_HOST       | Host do banco de dados               | Sim         |
| MYSQL_PORT       | Porta do banco de dados              | Sim         |
| MYSQL_USER       | Usuário do banco de dados            | Sim         |
| MYSQL_PASSWORD   | Senha do banco de dados              | Sim         |
| MYSQL_DB_NAME    | Nome do banco de dados               | Sim         |
| GATEWAY_1_URL    | URL do primeiro gateway de pagamento | Sim         |
| GATEWAY_1_EMAIL  | Email de autenticação do Gateway 1   | Sim         |
| GATEWAY_1_TOKEN  | Token de autenticação do Gateway 1   | Sim         |
| GATEWAY_2_URL    | URL do segundo gateway de pagamento  | Sim         |
| GATEWAY_2_TOKEN  | Token de autenticação do Gateway 2   | Sim         |
| GATEWAY_2_SECRET | Secret de autenticação do Gateway 2  | Sim         |

O arquivo .env contém dados sensíveis e nunca deve ser versionado.

---

## Instalação Com Docker

1. Clonar o repositório

git clone https://github.com/kaykeeb3/betalent-payment-api.git
cd betalent-payment-api

2. Copiar o arquivo de ambiente

cp .env.example .env

3. Gerar a chave da aplicação

node ace generate:key

Cole o valor gerado na variável APP_KEY do arquivo .env

4. Subir os containers

docker-compose up -d --build

5. Aguardar a inicialização do banco de dados

O healthcheck é automático. Aguarde cerca de 15 segundos antes
do próximo passo. Para acompanhar:

docker-compose logs -f mysql

Quando aparecer "ready for connections", prossiga.

6. Rodar as migrations

docker exec betalent_api node ace migration:run

7. Rodar as seeds

docker exec betalent_api node ace db:seed

8. Verificar que tudo está rodando

docker-compose ps

Todos os serviços devem estar com status "Up" ou "healthy".

9. Acessar a API

http://localhost:3333

---

## Seeds

| Seed          | Descrição                                                |
| ------------- | -------------------------------------------------------- |
| MainSeeder    | Orquestra a execução das seeds na ordem correta          |
| GatewaySeeder | Cria Gateway 1 (prioridade 1) e Gateway 2 (prioridade 2) |
| UserSeeder    | Cria o usuário administrador padrão                      |

AVISO: sem a execução das seeds, os gateways não estarão
registrados e todas as tentativas de compra falharão.

Credenciais do administrador criado pela seed:

- Email: admin@email.com
- Senha: Admin@2024!

Recomendado alterar a senha após o primeiro acesso.

---

## Testando as Rotas

Ferramentas recomendadas: Insomnia, Postman ou curl.

Ordem recomendada para validar o fluxo completo:

Passo 1 — Autenticar e obter token
POST http://localhost:3333/login

Passo 2 — Criar um produto para teste
POST http://localhost:3333/products
(usar token do passo 1)

Passo 3 — Realizar uma compra
POST http://localhost:3333/purchase
(rota pública, não precisa de token)
Atenção: não enviar o campo amount no body.
O valor será calculado automaticamente pelo backend.

Passo 4 — Confirmar a transação registrada
GET http://localhost:3333/transactions

Passo 5 — Confirmar que o cliente foi criado
GET http://localhost:3333/clients

Passo 6 — Realizar o reembolso
POST http://localhost:3333/transactions/:id/refund
(substituir :id pelo id retornado no passo 3)

---

## Rotas

#### POST /login

Autenticação: não requerida

Body:

```json
{
  "email": "admin@email.com",
  "password": "Admin@2024!"
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.YWRtaW5AZW1haWwuY29tOmFkbWluOjE3MTAwMDAwMDAwMDA.base64signature",
    "user": {
      "id": 1,
      "email": "admin@email.com",
      "role": "admin"
    }
  }
}
```

---

#### POST /purchase

Autenticação: não requerida

Body:

```json
{
  "client": {
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "products": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "card": {
    "number": "1234123412341234",
    "cvv": "123"
  }
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "client_id": 1,
    "gateway_id": 1,
    "external_id": "ext_987654321",
    "status": "paid",
    "amount": 20000,
    "card_last_numbers": "1234"
  }
}
```

---

#### PATCH /gateways/:id/toggle

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Body:

```json
{
  "isActive": false
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gateway 1",
    "isActive": false,
    "priority": 1
  }
}
```

---

#### PATCH /gateways/:id/priority

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Body:

```json
{
  "priority": 2
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gateway 1",
    "isActive": true,
    "priority": 2
  }
}
```

---

#### GET /users

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@email.com",
      "role": "admin"
    }
  ]
}
```

---

#### POST /users

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Body:

```json
{
  "email": "novo@email.com",
  "password": "SenhaForte@2024",
  "role": "admin"
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "novo@email.com",
    "role": "admin"
  }
}
```

---

#### PUT /users/:id

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Body:

```json
{
  "email": "editado@email.com",
  "role": "admin"
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "editado@email.com",
    "role": "admin"
  }
}
```

---

#### DELETE /users/:id

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

---

#### GET /products

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Produto Exemplo",
      "amount": 10000
    }
  ]
}
```

---

#### POST /products

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Body:

```json
{
  "name": "Novo Produto",
  "amount": 5000
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Novo Produto",
    "amount": 5000
  }
}
```

---

#### PUT /products/:id

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Body:

```json
{
  "name": "Produto Atualizado",
  "amount": 12000
}
```

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Produto Atualizado",
    "amount": 12000
  }
}
```

---

#### DELETE /products/:id

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "message": "Produto excluído com sucesso"
}
```

---

#### GET /clients

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com"
    }
  ]
}
```

---

#### GET /clients/:id

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "transactions": [
      {
        "id": 1,
        "amount": 20000,
        "status": "paid",
        "created_at": "2024-03-10T14:00:00.000Z"
      }
    ]
  }
}
```

---

#### GET /transactions

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "amount": 20000,
      "status": "paid"
    }
  ]
}
```

---

#### GET /transactions/:id

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "amount": 20000,
    "status": "paid",
    "client": {
      "name": "João Silva",
      "email": "joao@email.com"
    },
    "products": [
      {
        "id": 1,
        "name": "Produto Exemplo",
        "quantity": 2,
        "amount": 10000
      }
    ],
    "gateway": {
      "name": "Gateway 1"
    }
  }
}
```

---

#### POST /transactions/:id/refund

Autenticação: JWT obrigatório | Role: admin
Header: Authorization: Bearer {token}

Resposta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "refunded"
  }
}
```

---

## Testes

```bash
node ace test
```

Exemplo de saída esperada:

```
[ PASSED ] AuthTest — login com credenciais válidas
[ PASSED ] AuthTest — rejeita credenciais inválidas
[ PASSED ] PaymentTest — compra processada pelo Gateway 1
[ PASSED ] PaymentTest — fallback para Gateway 2 quando Gateway 1 falha
[ PASSED ] PaymentTest — rejeita body com campo amount
[ PASSED ] RefundTest — reembolso processado com sucesso
```
