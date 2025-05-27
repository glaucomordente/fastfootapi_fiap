import { v4 as uuidv4 } from 'uuid';

export type StatusPagamento = 'pendente' | 'aprovado' | 'recusado' | 'erro';

export class Pagamento {
    public readonly id: string; // UUID for the payment itself
    public idSessao: string; // Session ID from the cart
    public valorTotal: number;
    public status: StatusPagamento;
    public qrcodeUrl?: string;
    public qrcodeTexto?: string;
    public expiracao?: Date;
    public idTransacaoMp?: string; // Mercado Pago transaction ID
    public metodoPagamento?: string;
    public dataCriacao: Date;
    public dataAtualizacao: Date;
    public idPedido?: string; // Associated Order ID after registration

    constructor(
        id: string | null,
        idSessao: string,
        valorTotal: number,
    ) {
        if (!id) {
            id = uuidv4();
        }
        if (valorTotal <= 0) {
            throw new Error("Valor total do pagamento deve ser maior que zero.");
        }

        this.id = id;
        this.idSessao = idSessao;
        this.valorTotal = valorTotal;
        this.status = 'pendente';
        this.dataCriacao = new Date();
        this.dataAtualizacao = new Date();
    }

    gerarQRCode(url: string, texto: string, expiracaoSegundos: number): void {
        if (this.status !== 'pendente') {
            throw new Error("QRCode só pode ser gerado para pagamentos pendentes.");
        }
        this.qrcodeUrl = url;
        this.qrcodeTexto = texto;
        this.expiracao = new Date(Date.now() + expiracaoSegundos * 1000);
        this.dataAtualizacao = new Date();
        // Status remains 'pendente' until confirmation
    }

    confirmarPagamento(statusConfirmacao: 'aprovado' | 'recusado', idTransacaoMp: string, metodo: string): void {
        if (this.status !== 'pendente') {
            // Allow re-confirmation? Or handle idempotency?
            // For now, only allow confirming pending payments.
            throw new Error(`Pagamento ${this.id} não está pendente (status atual: ${this.status}).`);
        }
        this.status = statusConfirmacao;
        this.idTransacaoMp = idTransacaoMp;
        this.metodoPagamento = metodo;
        this.dataAtualizacao = new Date();
        // Clear QR code info as it's no longer relevant?
        // this.qrcodeUrl = undefined;
        // this.qrcodeTexto = undefined;
        // this.expiracao = undefined;
    }

    associarPedido(idPedido: string): void {
        if (this.status !== 'aprovado') {
            throw new Error("Pedido só pode ser associado a um pagamento aprovado.");
        }
        if (this.idPedido) {
            throw new Error(`Pagamento ${this.id} já está associado ao pedido ${this.idPedido}.`);
        }
        this.idPedido = idPedido;
        this.dataAtualizacao = new Date();
    }

    verificarExpiracao(): { statusTimer: 'ativo' | 'expirado'; tempoRestante: number } {
        if (!this.expiracao || this.status !== 'pendente') {
            return { statusTimer: 'expirado', tempoRestante: 0 }; // Or maybe 'inativo'? Contract says 'expirado'
        }
        const agora = new Date();
        const tempoRestanteMs = this.expiracao.getTime() - agora.getTime();

        if (tempoRestanteMs <= 0) {
            // Optionally update status to 'expirado' or 'erro' here?
            // this.status = 'erro'; // Or a specific 'expirado' status if needed
            // this.dataAtualizacao = new Date();
            return { statusTimer: 'expirado', tempoRestante: 0 };
        } else {
            return { statusTimer: 'ativo', tempoRestante: Math.round(tempoRestanteMs / 1000) };
        }
    }
}

