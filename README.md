# 🛒 Store API

> API RESTful para gerenciamento de produtos e usuários, construída com TypeScript e Express. Conta com autenticação via cookie HTTP-only, autorização baseada em permissões e uma arquitetura MVC desacoplada com camadas de serviço.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Como Rodar](#como-rodar)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Autenticação](#autenticação)
- [Referência da API](#referência-da-api)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Visão Geral

A Store API é uma aplicação backend que permite que usuários autenticados gerenciem produtos por meio de uma interface CRUD completa. O sistema contempla cadastro de usuários, login com geração de token JWT via cookie HTTP-only e proteção de rotas com base em autenticação e permissões.

---

## Arquitetura

O projeto segue o padrão **MVC desacoplado**, com uma **camada de serviço** dedicada a toda a lógica de negócio. Essa separação garante que os controllers permaneçam enxutos, os models focados na representação dos dados, e as regras de negócio completamente isoladas e testáveis.

```
Requisição → Router → Middleware → Controller → Service → Model → Banco de Dados
```

O design é guiado pelos **princípios SOLID**:

- **S**ingle Responsibility — cada classe tem uma única responsabilidade bem definida.
- **O**pen/Closed — comportamentos são estendidos via abstrações, sem modificar o que já existe.
- **L**iskov Substitution — implementações concretas são intercambiáveis por meio de interfaces.
- **I**nterface Segregation — os contratos são pequenos e específicos.
- **D**ependency Inversion — módulos de alto nível dependem de abstrações, não de implementações concretas.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Framework | Express |
| Banco de Dados | MongoDB (via Mongoose) |
| Validação | Zod |
| Autenticação | JSON Web Token + Cookie HTTP-only |
| Hash de Senha | Bcrypt |
| Testes | Jest |
| Segurança | CORS |

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Instância do MongoDB (local ou Atlas)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/store-api.git
cd store-api

# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Preencha o arquivo `.env` com as suas configurações (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

```bash
# Rodar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start
```

---

## Variáveis de Ambiente

```env
PORT=3000
MONGODB_URI=sua_url_aqui
JWT_SECRET=sua_chave_secreta_aqui
```

---

## Autenticação

A API utiliza **cookie HTTP-only** para o transporte do token JWT. Ao realizar login com sucesso, o servidor emite um `Set-Cookie` na resposta — o navegador o armazena e o envia automaticamente em todas as requisições subsequentes.

```
[Login] → servidor define Set-Cookie: token=<jwt>
[Requisição protegida] → navegador envia Cookie: token=<jwt> automaticamente
[Middleware] → lê o cookie, valida o JWT e libera ou rejeita a requisição
```

Essa abordagem evita que o token fique exposto no JavaScript do frontend (`localStorage`, `sessionStorage`), reduzindo a superfície de ataque a XSS.

> **Integração com o servidor frontend:** o servidor que serve a aplicação frontend lê o cookie recebido e o repassa via cabeçalho `Authorization: Bearer <token>` nas chamadas à API, mantendo a compatibilidade com o fluxo padrão de autenticação JWT.

---

## Referência da API

### Auth

| Método | Endpoint | Descrição | Requer Auth |
|---|---|---|---|
| `POST` | `/api/login/register` | Cadastra um novo usuário | Não |
| `POST` | `/api/login/enter` | Autentica o usuário e define o cookie JWT | Não |
| `POST` | `/api/login/logout` | Encerra a sessão e limpa o cookie | Sim |

#### Cadastro — `POST /api/login/register`

```json
// Corpo da requisição
{
  "name": "Victor",
  "email": "victor@email.com",
  "password": "senhaforte123"
}

// Resposta 201
{
  "message": "Usuário criado com sucesso",
}
```

#### Login — `POST /api/login/enter`

```json
// Corpo da requisição
{
  "email": "victor@email.com",
  "password": "senhaforte123"
}

// Resposta 200
// O token NÃO é retornado no corpo — ele é definido via Set-Cookie HTTP-only.
{
  "message": "Login realizado com sucesso"
}
```

```
Set-Cookie: token=eyJhbGci...; HttpOnly; Path=/; SameSite=Strict
```

---

### Usuários

| Método | Endpoint | Descrição | Requer Auth & Permission |
|---|---|---|---|
| `GET` | `/api/user/` | Lista todos os usuários | Somente Auth |
| `GET` | `/api/user/profile/:id` | Busca um usuário pelo ID | Somente Auth |
| `PUT` | `/api/user/profile/updated/:id` | Atualiza um usuário | Ambos |
| `DELETE` | `/api/user/profile/delete/:id` | Remove um usuário | Ambos |

---

### Produtos

| Método | Endpoint | Descrição | Requer Auth & Permission |
|---|---|---|---|
| `POST` | `/api/product/create` | Cria um novo produto | Ambos (admin | employeer) |
| `GET` | `/api/product/list` | Lista todos os produtos | Auth |
| `GET` | `/api/product/list/:id` | Busca um produto pelo ID | Auth |
| `PUT` | `/api/product/update/:id` | Atualiza um produto | Ambos (admin | employeer) |
| `DELETE` | `/api/product/delete/:id` | Remove um produto | Ambos (admin) |

**Obs 1:** (admin | employeer), significa que a aplicação verifica qual o tipo da sua conta, se você for funcionário ou admin, você tem permissão, caso for "basic", sua permissão é negada.

**Obs 2:**  | `PUT` | `/api/product/:id` | -> Aqui funciona também como um delete para contas tipo employeer, já que eles não podem deletar exclusivamente, mas podem mudar o status do produto para inativo, logo ele vai sumir para as demais contas, menos para conta admin, que vê ambos os status inativo e ativo.

**Obs 3:** | `GET` | `/api/product/list` | -> O retorno desse get é com base no userCreate, o valor de userCreate é o _id do usuário que o registrou, você estando na sua conta, consegue ver quais produtos foram registrados com seu _id

#### Criar Produto — `POST /api/product/create`

```json
// Corpo da requisição
{
  "name": "Teclado Mecânico",
  "description": "Teclado para uso profissional",
  "price": 349.90,
  "image": "url da imagem aqui",
}

// Resposta 201
{
  "message": "Produto cadastrado com sucesso",
}
```

---

## Testes

O projeto utiliza **Jest** para testes unitários. Os serviços são testados de forma isolada, com as dependências externas mockadas para que os testes nunca acessem um banco de dados real.

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

---

## Estrutura do Projeto

```
src/
├── config/                     # Configurações da aplicação (DB, env, etc.)
├── controllers/
│   ├── auth.controller.ts      # Cadastro e login
│   ├── product.controller.ts   # CRUD de produtos
│   └── user.controller.ts      # CRUD de usuários
├── middleware/
│   └── index.ts                # Verificação do cookie JWT e permissões
├── models/
│   ├── product/                # Schema Mongoose do produto
│   └── user/                   # Schema Mongoose do usuário
├── router/
│   ├── auth.router.ts
│   ├── product.router.ts
│   └── user.router.ts
├── services/
│   ├── productService.ts       # Lógica de negócio de produtos
│   └── userService.ts          # Lógica de negócio de usuários
├── test/
│   └── UserService.test.ts
├── utils/                      # Funções utilitárias compartilhadas
├── express.d.ts                # Extensão de tipos do Express
├── index.ts                    # Entry point da aplicação
└── logger.ts                   # Configuração de logs
```

---

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).