import { PagamentoUseCase, GerarQrCodeDTO, GerarQrCodeResponse, ConfirmarPagamentoDTO, ConfirmarPagamentoResponse, RegistrarPedidoDTO, RegistrarPedidoResponse, VerificarTimerResponse } from "../domain/ports/in/PagamentoUseCase";
import { PagamentoRepository } from "../domain/ports/out/PagamentoRepository";
import { CarrinhoRepository } from "../../carrinho/domain/ports/out/CarrinhoRepository"; // Need cart repo
import { OrderUseCase } from "../../orders/domain/ports/in/OrderUseCase"; // Need Order use case for registration
import { Pagamento } from "../domain/entities/Pagamento";
import { v4 as uuidv4 } from 'uuid';

// Mock QR Code generation service
const mockQrCodeService = {
  generate: async (paymentId: string, amount: number): Promise<{ url: string; text: string; expires: number }> => {
    // Simulate API call to QR code provider (e.g., Mercado Pago)
    console.log(`[Mock QR Service] Generating QR for payment ${paymentId}, amount ${amount}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
    const qrText = `pix-qr-code-payload-for-${paymentId}-${amount}`;
    const qrUrl = `https://api.mercadopago.com/v1/payments/qr/${paymentId}`; // Mock URL
    const expirationSeconds = 300; // 5 minutes expiration
    console.log(`[Mock QR Service] Generated: URL=${qrUrl}, Text=${qrText}, Expires in ${expirationSeconds}s`);
    return { url: qrUrl, text: qrText, expires: expirationSeconds };
  }
};

export class PagamentoService implements PagamentoUseCase {
  constructor(
    private readonly pagamentoRepository: PagamentoRepository,
    private readonly carrinhoRepository: CarrinhoRepository,
    private readonly orderUseCase: OrderUseCase // Inject OrderUseCase
  ) {}

  async gerarQrCodePagamento(data: GerarQrCodeDTO): Promise<GerarQrCodeResponse> {
    const timestamp = new Date().toISOString();
    try {
      // 1. Find the confirmed cart for the session
      const carrinho = await this.carrinhoRepository.findByIdSessao(data.id_sessao);
      if (!carrinho) {
        return { status: "erro", mensagem: "Carrinho não encontrado para esta sessão.", timestamp };
      }
      if (!carrinho.validado) {
        return { status: "erro", mensagem: "Carrinho não foi confirmado.", timestamp };
      }
      if (carrinho.total !== data.valor_total) {
          // Optional: Validate if provided total matches cart total
          console.warn(`[PagamentoService] Valor total fornecido (${data.valor_total}) difere do total do carrinho (${carrinho.total}) para sessão ${data.id_sessao}`);
          // Decide whether to proceed or return an error based on business rules
          // For now, proceed with the provided value, but log a warning.
          // return { status: "erro", mensagem: "Valor total diverge do carrinho.", timestamp };
      }

      // 2. Check if a pending payment already exists for this session
      let pagamento = await this.pagamentoRepository.findBySessaoId(data.id_sessao);
      if (pagamento && pagamento.status === 'pendente') {
          // If a pending payment exists, check if it's expired
          const timerStatus = pagamento.verificarExpiracao();
          if (timerStatus.statusTimer === 'ativo') {
              // Return existing QR code if not expired
              return {
                  status: "sucesso",
                  qrcode_url: pagamento.qrcodeUrl,
                  qrcode_texto: pagamento.qrcodeTexto,
                  id_pagamento: pagamento.id,
                  expiracao: pagamento.expiracao?.toISOString(),
                  timestamp
              };
          } else {
              // If expired, potentially mark the old one as 'erro' or 'expirado'
              // and proceed to create a new one.
              console.log(`[PagamentoService] Pagamento pendente ${pagamento.id} expirado. Gerando novo QR code.`);
              // Optionally update the status of the expired payment
              // pagamento.status = 'erro'; // Or 'expirado'
              // await this.pagamentoRepository.save(pagamento);
          }
      }
      // Or if payment exists but is approved/recusado, prevent new QR code?
      if (pagamento && (pagamento.status === 'aprovado' || pagamento.status === 'recusado')) {
          return { status: "erro", mensagem: `Já existe um pagamento ${pagamento.status} para esta sessão.`, timestamp };
      }

      // 3. Create a new Pagamento entity
      pagamento = new Pagamento(null, data.id_sessao, data.valor_total);
      await this.pagamentoRepository.save(pagamento); // Save initial pending state

      // 4. Generate QR Code (using mock service)
      const qrData = await mockQrCodeService.generate(pagamento.id, pagamento.valorTotal);

      // 5. Update Pagamento with QR Code details
      pagamento.gerarQRCode(qrData.url, qrData.text, qrData.expires);
      await this.pagamentoRepository.save(pagamento); // Save updated state with QR

      return {
        status: "sucesso",
        qrcode_url: pagamento.qrcodeUrl,
        qrcode_texto: pagamento.qrcodeTexto,
        id_pagamento: pagamento.id,
        expiracao: pagamento.expiracao?.toISOString(),
        timestamp
      };
    } catch (error: any) {
      console.error("[PagamentoService] Erro ao gerar QR code:", error);
      return { status: "erro", mensagem: error.message || "Erro interno ao gerar QR code.", timestamp };
    }
  }

  async confirmarPagamento(data: ConfirmarPagamentoDTO): Promise<ConfirmarPagamentoResponse> {
    const timestamp = new Date().toISOString();
    try {
      const pagamento = await this.pagamentoRepository.findById(data.id_pagamento);
      if (!pagamento) {
        return { status: "erro", mensagem: "Pagamento não encontrado.", timestamp };
      }

      // Basic validation (e.g., check if amount matches)
      if (pagamento.valorTotal !== data.valor_pago) {
          console.warn(`[PagamentoService] Valor pago (${data.valor_pago}) diverge do valor do pagamento (${pagamento.valorTotal}) para ID ${data.id_pagamento}`);
          // Decide how to handle discrepancy (e.g., refuse, partial payment?)
          // For now, refuse if amounts don't match exactly.
          return { status: "erro", mensagem: "Valor pago diverge do valor do pagamento.", timestamp };
      }

      // Update payment status using domain logic
      pagamento.confirmarPagamento(data.status_pagamento, data.id_transacao_mp, data.metodo_pagamento);
      await this.pagamentoRepository.save(pagamento);

      // TODO: Potentially trigger order registration immediately if approved?
      // Or rely on the separate registrarPedido call?
      // If approved, could call this.registrarPedido internally?
      // if (pagamento.status === 'aprovado') {
      //    await this.registrarPedido({ id_sessao: pagamento.idSessao, id_pagamento: pagamento.id });
      // }

      return {
        status: "sucesso",
        mensagem: `Pagamento ${data.status_pagamento} com sucesso.`,
        pagamento_confirmado: pagamento.status === 'aprovado',
        timestamp
      };
    } catch (error: any) {
      console.error("[PagamentoService] Erro ao confirmar pagamento:", error);
      return { status: "erro", mensagem: error.message || "Erro interno ao confirmar pagamento.", timestamp };
    }
  }

  async registrarPedido(data: RegistrarPedidoDTO): Promise<RegistrarPedidoResponse> {
    const timestamp = new Date().toISOString();
    try {
      // 1. Find the payment and verify it's approved
      const pagamento = await this.pagamentoRepository.findById(data.id_pagamento);
      if (!pagamento) {
        return { status: "erro", mensagem: "Pagamento não encontrado.", timestamp };
      }
      if (pagamento.idSessao !== data.id_sessao) {
          return { status: "erro", mensagem: "ID da sessão não corresponde ao pagamento.", timestamp };
      }
      if (pagamento.status !== 'aprovado') {
        return { status: "erro", mensagem: `Pagamento não está aprovado (status: ${pagamento.status}).`, timestamp };
      }
      if (pagamento.idPedido) {
          // Order already registered for this payment
          // Need Order details to return existing info
          const existingOrder = await this.orderUseCase.getOrderById(pagamento.idPedido);
          return {
              status: "sucesso", // Or maybe a different status like "ja_registrado"?
              mensagem: "Pedido já registrado para este pagamento.",
              id_pedido: pagamento.idPedido,
              numero_pedido: existingOrder?.numeroPedido.toString(), // Assuming numeroPedido exists
              timestamp
          };
      }

      // 2. Find the associated cart (needed for order items)
      const carrinho = await this.carrinhoRepository.findByIdSessao(data.id_sessao);
      if (!carrinho) {
        // This shouldn't happen if payment exists, but check anyway
        return { status: "erro", mensagem: "Carrinho associado não encontrado.", timestamp };
      }

      // 3. Create the order using OrderUseCase
      const orderData = {
        clienteId: data.id_cliente, // Optional client ID
        itens: carrinho.getItensFormatado().map(item => ({
          produtoId: item.produto.id,
          quantidade: item.quantidade,
          precoUnitario: item.produto.preco_unitario,
          observacoes: item.observacoes
        })),
        valorTotal: carrinho.total,
        pagamentoId: pagamento.id // Link payment to order
      };

      const novoPedido = await this.orderUseCase.createOrder(orderData);

      // 4. Associate the order ID with the payment
      pagamento.associarPedido(novoPedido.id);
      await this.pagamentoRepository.save(pagamento);

      // 5. Optionally delete the cart now that the order is placed
      await this.carrinhoRepository.deleteByIdSessao(data.id_sessao);

      return {
        status: "sucesso",
        mensagem: "Pedido registrado com sucesso.",
        id_pedido: novoPedido.id,
        numero_pedido: novoPedido.numeroPedido.toString(), // Assuming numeroPedido exists
        timestamp
      };
    } catch (error: any) {
      console.error("[PagamentoService] Erro ao registrar pedido:", error);
      return { status: "erro", mensagem: error.message || "Erro interno ao registrar pedido.", timestamp };
    }
  }

  async verificarTimerPagamento(idPagamento: string): Promise<VerificarTimerResponse> {
    const timestamp = new Date().toISOString();
    try {
      const pagamento = await this.pagamentoRepository.findById(idPagamento);
      if (!pagamento || pagamento.status !== 'pendente') {
        // If payment not found or not pending, timer is considered expired/inactive
        return { status: "expirado", tempo_restante: 0, timestamp };
      }

      const timerInfo = pagamento.verificarExpiracao();
      // Optionally save if status changed due to expiration check?
      // await this.pagamentoRepository.save(pagamento);

      return {
        status: timerInfo.statusTimer,
        tempo_restante: timerInfo.tempoRestante,
        timestamp
      };
    } catch (error: any) {
      console.error("[PagamentoService] Erro ao verificar timer:", error);
      // Return expired status on error?
      return { status: "expirado", tempo_restante: 0, timestamp };
    }
  }
}

