# BeTalent: Multi-Gateway Payment API 🚀

[![AdonisJS](https://img.shields.io/badge/AdonisJS-5.0-blueviolet?style=for-the-badge&logo=adonisjs)](https://preview.adonisjs.com/releases/v5/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-6fb33f?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

API de alto desempenho para orquestração de pagamentos, projetada para gerenciar múltiplos gateways com **fallback automático** e **cálculo dinâmico de valores**. Este projeto foi desenvolvido seguindo as melhores práticas de arquitetura, garantindo segurança e escalabilidade.

---

## 🏗️ Arquitetura e Diferenciais

O coração deste projeto é o `PaymentService`, que implementa um mecanismo de **resiliência de transações**:

- **Cálculo de Valor no Backend**: Evita fraudes garantindo que o valor final seja calculado com base nos produtos reais cadastrados.
- **Fallback Automático**: Se o gateway prioritário falhar (instabilidade ou erro de rede), a API tenta automaticamente o próximo da lista de prioridades.
- **Auditoria Completa**: Cada transação armazena o histórico do gateway utilizado, IDs externos e logs de status.
- **Segurança (PCI-Safe)**: Não armazenamos dados sensíveis como CVV ou número completo do cartão. Apenas os 4 últimos dígitos são salvos para identificação.

---

## 🛠️ Requisitos do Sistema

- **Docker** v20.10+ e **Docker Compose** v2.0+
- **Node.js** v18+ (opcional, recomendado o uso via Docker)
- **Extensão REST Client** (opcional, para testes rápidos no VS Code)

---

## 🚀 Instalação Rápida (Docker)

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/kaykeeb3/betalent-payment-api.git
   cd betalent-payment-api
   ```

2. **Configure o Ambiente**

   ```bash
   cp .env.example .env
   # Gere a chave da aplicação (será exibida no terminal)
   node ace generate:key
   # Copie o valor gerado e cole na variável APP_KEY do seu arquivo .env
   ```

3. **Suba os Containers**

   ```bash
   docker-compose up -d --build
   ```

4. **Prepare o Banco de Dados**
   Aguarde cerca de 15 segundos para o MySQL inicializar completamente e então execute:

   ```bash
   # Executar as migrações (criação das tabelas)
   docker exec betalent_api node ace migration:run

   # Popular dados iniciais (Gateways, Produtos e Usuário Admin)
   docker exec betalent_api node ace db:seed
   ```

---

## 🔐 Autenticação

A API utiliza um sistema de autenticação segura para rotas administrativas.

- **Login Administrador (Seed):**
  - **Email:** `admin@email.com`
  - **Senha:** `Admin@2024!`

Após o login, utilize o token retornado no cabeçalho:
`Authorization: Bearer token`

---

## 📡 Endpoints Principais

Abaixo estão listadas as principais rotas da aplicação. Para uma documentação interativa e completa, você pode utilizar o arquivo **`routes.http`** disponível na raiz do projeto.

### 💳 Pagamentos (Público)

- `POST /purchase`: Realiza uma compra. O corpo deve conter informações do cliente, lista de produtos e dados do cartão (sem amount).

### 🛍️ Produtos (Admin)

- `GET /products`: Listagem completa.
- `POST /products`: Criação de novo produto.
- `PUT /products/:id`: Atualização parcial ou total.

### 🧾 Transações (Admin)

- `GET /transactions`: Histórico geral de vendas.
- `GET /transactions/:id`: Detalhes específicos com relacionamento de produtos.
- `POST /transactions/:id/refund`: Inicia o estorno de uma transação junto ao gateway original.

### 👥 Clientes (Admin)

- `GET /clients`: Lista de clientes que já compraram.
- `GET /clients/:id`: Perfil detalhado com histórico de transações e produtos vinculados.

---

## ⚙️ Configuração de Gateways

Você pode gerenciar o comportamento do fallback em tempo real:

- **Prioridade:** Defina a ordem de tentativa (`PATCH /gateways/:id/priority`).
- **Ativação:** Ative ou desative gateways instantaneamente (`PATCH /gateways/:id/toggle`).

---

## 🧪 Testes Automatizados

O projeto conta com uma suíte de testes funcionais que validam desde a autenticação até o fluxo completo de fallback entre gateways.

**Para rodar os testes:**

```bash
docker exec betalent_api node ace test functional
```

---

## 👨‍💻 Ferramentas de Desenvolvedor

Para facilitar os testes sem depender de ferramentas externas como Postman, este repositório inclui um arquivo **`routes.http`**.

**Como usar:**

1. Instale a extensão **REST Client** no VS Code.
2. Abra o arquivo `routes.http`.
3. Clique em **"Send Request"** nos blocos de código para executar as chamadas diretamente no editor.

---

## 🛡️ Licença

Este projeto é destinado a fins de avaliação técnica (**Nível 2 BeTalent**). Todos os direitos reservados.
