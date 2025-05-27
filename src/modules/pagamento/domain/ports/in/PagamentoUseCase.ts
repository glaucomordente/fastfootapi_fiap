import { Pagamento } from "../../domain/entities/Pagamento";

// DTO for generating QR code
export interface GerarQrCodeDTO {
  id_sessao: string;
  valor_total: number;
}

// Response DTO for generating QR code
export interface GerarQrCodeResponse {
  status: string; // "sucesso" or "erro"
  qrcode_url?: string;
  qrcode_texto?: string;
  id_pagamento?: string;
  expiracao?: string; // ISO Date string
  timestamp: string; // ISO Date string
  mensagem?: string; // Error message
}

// DTO for confirming payment (webhook simulation)
export interface ConfirmarPagamentoDTO {
  id_pagamento: string;
  status_pagamento: "aprovado" | "recusado";
  id_transacao_mp: string;
  valor_pago: number;
  metodo_pagamento: string;
}

// Response DTO for confirming payment
export interface ConfirmarPagamentoResponse {
  status: string; // "sucesso" or "erro"
  mensagem: string;
  pagamento_confirmado?: boolean;
  timestamp: string; // ISO Date string
}

// DTO for registering order after payment
export interface RegistrarPedidoDTO {
  id_sessao: string;
  id_pagamento: string;
  id_cliente?: string; // Optional client ID
}

// Response DTO for registering order
export interface RegistrarPedidoResponse {
  status: string; // "sucesso" or "erro"
  mensagem: string;
  id_pedido?: string;
  numero_pedido?: string;
  timestamp: string; // ISO Date string
}

// Response DTO for checking timer
export interface VerificarTimerResponse {
  status: string; // "ativo" or "expirado"
  tempo_restante: number; // Seconds
  timestamp: string; // ISO Date string
}

/**
 * PagamentoUseCase Interface (Input Port)
 *
 * Defines operations related to the payment process.
 */
export interface PagamentoUseCase {
  /**
   * Generate a QR code for payment.
   * @param data DTO containing session ID and total value.
   * @returns Promise resolving to the QR code generation result.
   */
  gerarQrCodePagamento(data: GerarQrCodeDTO): Promise<GerarQrCodeResponse>;

  /**
   * Confirm a payment (simulating webhook callback).
   * @param data DTO containing payment confirmation details.
   * @returns Promise resolving to the payment confirmation result.
   */
  confirmarPagamento(data: ConfirmarPagamentoDTO): Promise<ConfirmarPagamentoResponse>;

  /**
   * Register an order after successful payment.
   * @param data DTO containing session, payment, and optional client IDs.
   * @returns Promise resolving to the order registration result.
   */
  registrarPedido(data: RegistrarPedidoDTO): Promise<RegistrarPedidoResponse>;

  /**
   * Check the remaining time for a pending payment QR code.
   * @param idPagamento The ID of the payment.
   * @returns Promise resolving to the timer status.
   */
  verificarTimerPagamento(idPagamento: string): Promise<VerificarTimerResponse>;
}

