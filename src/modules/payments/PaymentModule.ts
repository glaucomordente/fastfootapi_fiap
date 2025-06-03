import { PaymentController } from './adapters/in/web/PaymentController';

export class PaymentModule {
  private paymentController: PaymentController;

  constructor() {
    this.paymentController = new PaymentController();
  }

  getPaymentController(): PaymentController {
    return this.paymentController;
  }
}
