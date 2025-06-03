# FastFood API

API para sistema de autoatendimento de fast food.

## Arquitetura Hexagonal

Este projeto utiliza a Arquitetura Hexagonal (também conhecida como "Ports and Adapters") para organizar o código de forma modular e desacoplada.

### Estrutura do Projeto

```
src/
├── modules/                  # Módulos da aplicação organizados por domínio
│   ├── categories/           # Módulo de categorias
│   │   ├── adapters/         # Adaptadores para interfaces externas
│   │   │   ├── in/           # Adaptadores de entrada (controllers)
│   │   │   └── out/          # Adaptadores de saída (repositories)
│   │   ├── application/      # Lógica de aplicação
│   │   │   └── services/     # Serviços que implementam os casos de uso
│   │   └── domain/           # Regras de negócio e entidades
│   │       ├── entities/     # Entidades de domínio
│   │       └── ports/        # Interfaces (portas)
│   │           ├── in/       # Portas de entrada (casos de uso)
│   │           └── out/      # Portas de saída (repositórios)
│   └── products/             # Módulo de produtos (estrutura similar)
├── lib/                      # Bibliotecas e configurações
├── configs/                  # Configurações da aplicação
└── routes/                   # Rotas da API
```

### Princípios da Arquitetura Hexagonal

1. **Separação de Responsabilidades**: O código é organizado em camadas com responsabilidades bem definidas.
2. **Independência de Frameworks**: A lógica de negócio é independente de frameworks e bibliotecas externas.
3. **Testabilidade**: A arquitetura facilita a escrita de testes unitários e de integração.
4. **Adaptabilidade**: É fácil trocar implementações de adaptadores sem afetar a lógica de negócio.

### Camadas da Arquitetura

1. **Domain (Domínio)**
   - Contém as entidades de negócio e regras de domínio
   - Define as interfaces (portas) para interagir com o domínio

2. **Application (Aplicação)**
   - Implementa os casos de uso da aplicação
   - Orquestra as entidades de domínio para realizar operações de negócio

3. **Adapters (Adaptadores)**
   - **Input Adapters**: Adaptam requisições externas para o formato esperado pelo domínio
   - **Output Adapters**: Implementam as interfaces de saída definidas pelo domínio

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- TypeORM
- PostgreSQL
- Swagger

## Dados Iniciais

Ao iniciar a aplicação, os seguintes dados são automaticamente criados no banco de dados:

### Categorias

1. **Lanches** - Hambúrgueres, sanduíches e outros lanches
2. **Bebidas** - Refrigerantes, sucos, água e outras bebidas
3. **Acompanhamentos** - Batatas fritas, onion rings e outros acompanhamentos
4. **Sobremesas** - Sorvetes, milk-shakes e outras sobremesas

### Produtos

**Lanches:**
- Hambúrguer Clássico - R$ 18,90
- Cheeseburger Duplo - R$ 24,90

**Bebidas:**
- Refrigerante Cola - R$ 5,90
- Suco de Laranja - R$ 7,90

**Acompanhamentos:**
- Batata Frita - R$ 9,90
- Onion Rings - R$ 11,90

**Sobremesas:**
- Sundae de Chocolate - R$ 8,90
- Milkshake de Morango - R$ 12,90

Cada produto já possui um estoque inicial e campos de data de criação e atualização.

## Configuração e Execução

### Pré-requisitos

- Node.js
- PostgreSQL
- Docker (opcional)

### Instalação Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar o PostgreSQL localmente usando Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fastfood_db -p 5432:5432 -d postgres:15-alpine

# Iniciar o servidor de desenvolvimento
npm run dev
```

### Execução com Docker

```bash
# Construir e iniciar os containers
docker-compose up -d

# Ver logs da aplicação
docker-compose logs -f fastfood-api

# Parar os containers
docker-compose down

# Reconstruir os containers após alterações
docker-compose up -d --build
```

### Comandos TypeORM

```bash
# Gerar uma nova migração
npm run migration:generate -- nome-da-migracao

# Executar migrações
npm run migration:run
```

## Fluxo de Status dos Pedidos

Os pedidos no sistema passam por diferentes status que representam seu ciclo de vida completo, desde a criação até a entrega ao cliente. Abaixo está a explicação de cada status e o fluxo típico de um pedido:

### Status Disponíveis

1. **IN_CART** - O cliente adicionou itens ao carrinho, mas ainda não finalizou o pedido.
2. **PAYMENT_PENDING** - O pedido foi criado e está aguardando a confirmação do pagamento.
3. **PAYMENT_CONFIRMED** - O pagamento foi processado com sucesso e o pedido está pronto para ser preparado.
4. **IN_PREPARATION** - A cozinha está ativamente preparando o pedido.
5. **READY_FOR_PICKUP** - O pedido está pronto e aguardando que o cliente o retire.
6. **PICKED_UP** - O cliente retirou o pedido.
7. **COMPLETED** - O pedido foi finalizado com sucesso.
8. **CANCELED** - O pedido foi cancelado pelo cliente ou pelo restaurante antes da conclusão.

### Fluxo Típico de um Pedido

```
IN_CART → PAYMENT_PENDING → PAYMENT_CONFIRMED → IN_PREPARATION → READY_FOR_PICKUP → PICKED_UP → COMPLETED
```

### Transições de Status Possíveis

- Um pedido em **PAYMENT_PENDING** pode ser:
  - Atualizado para **PAYMENT_CONFIRMED** quando o pagamento é processado
  - Atualizado para **CANCELED** se o pagamento falhar ou o cliente cancelar

- Um pedido em **PAYMENT_CONFIRMED** pode ser:
  - Atualizado para **IN_PREPARATION** quando a cozinha começa a preparar
  - Atualizado para **CANCELED** se houver algum problema (ex: falta de ingredientes)

- Um pedido em **IN_PREPARATION** pode ser:
  - Atualizado para **READY_FOR_PICKUP** quando estiver pronto
  - Atualizado para **CANCELED** em casos excepcionais

- Um pedido em **READY_FOR_PICKUP** pode ser:
  - Atualizado para **PICKED_UP** quando o cliente retirar
  - Atualizado para **CANCELED** se o cliente não buscar após um longo período

- Um pedido em **PICKED_UP** é automaticamente considerado **COMPLETED**

- Um pedido **CANCELED** não pode mudar para nenhum outro status

### Endpoints para Gerenciamento de Status

- `PUT /api/orders/{id}/status` - Atualiza o status de um pedido
- `PUT /api/orders/{id}/cancel` - Cancela um pedido
- `PUT /api/orders/{id}/prepare` - Inicia a preparação de um pedido
- `PUT /api/orders/{id}/complete` - Marca um pedido como pronto para retirada
- `PUT /api/orders/{id}/confirm-pickup` - Confirma que o cliente retirou o pedido
- `POST /api/payments/confirm` - Confirma o pagamento de um pedido

## Documentação da API

A documentação da API está disponível em `/api-docs` quando o servidor estiver em execução.
