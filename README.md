# FastFoodAPI FIAP - Tech Challenge Fase 2

API para sistema de autoatendimento de fast food, desenvolvida como parte do Tech Challenge Fase 2 da FIAP.

## Descrição

Esta API implementa funcionalidades para gerenciamento de clientes (identificação/cadastro), produtos, carrinho de compras, pagamento (simulado com QR Code) e pedidos (parcialmente implementado).

## Pré-requisitos

*   Docker
*   Docker Compose

## Configuração e Execução

1.  **Clone o repositório ou extraia o arquivo zip:**
    ```bash
    # Se clonando
    git clone <url_do_repositorio>
    cd fastfootapi_fiap

    # Se extraindo
    unzip fastfootapi_fiap.zip
    cd fastfootapi_fiap
    ```

2.  **Configure as variáveis de ambiente:**
    *   Copie o arquivo de exemplo `.env.example` para `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Revise e ajuste as variáveis no arquivo `.env` se necessário (portas, credenciais do banco de dados).

3.  **Suba os containers com Docker Compose:**
    *   Este comando fará o build da imagem da aplicação (se ainda não existir) e iniciará os containers da aplicação e do banco de dados PostgreSQL.
    ```bash
    docker compose up --build -d
    ```

## Uso

*   **API Base URL:** `http://localhost:<PORTA_APP>/api/v1` (a porta padrão é 3000, definida em `.env`)
*   **Documentação da API (Swagger):** `http://localhost:<PORTA_APP>/api-docs`

## Limitações e Observações

*   **Ambiente Docker:** A execução e validação completa da aplicação dependem de um ambiente com Docker e Docker Compose instalados e funcionais.
*   **Módulo Pedido:** As rotas relacionadas ao status do pedido e fluxo de cozinha (`/api/v1/pedidos/...`) foram definidas nos contratos, mas a implementação no código (`OrderService`, `OrderRepository`, `OrderController`) contém apenas placeholders e **não está funcional**. A lógica de atualização de status e consulta de pedidos pendentes precisa ser desenvolvida.
*   **Testes:** Testes automatizados (unitários, integração) não foram implementados ou executados no escopo deste desenvolvimento.
A validação do build e execução via Docker não pôde ser realizada no ambiente de desenvolvimento atual devido à ausência do Docker.
*   **Pagamento:** A geração de QR Code e a confirmação de pagamento utilizam serviços simulados (mocks) dentro do `PagamentoService` e não se integram com um provedor real como Mercado Pago.
*   **Seeds:** O script de seeds (`src/database/seeds.ts`) existe mas não está configurado para rodar automaticamente na inicialização (`src/index.ts`).

## Estrutura do Projeto

O projeto segue uma estrutura modular, organizada por funcionalidades (cliente, produto, carrinho, pagamento, pedido, etc.), utilizando princípios de arquitetura hexagonal (portas e adaptadores) e TypeORM para persistência de dados.

