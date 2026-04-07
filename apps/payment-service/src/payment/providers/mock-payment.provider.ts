import { Injectable, Logger } from '@nestjs/common';
import { CardDetails, ChargeResult, PaymentProvider } from './payment-provider.interface';

// Mock provider: only accepts card 4242 4242 4242 4242 / 12/34 / 123
// All other cards → fail with 'card_declined'
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);

  async charge(orderId: string, amount: string, card: CardDetails): Promise<ChargeResult> {
    const normalized = card.number.replace(/\s/g, '');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (normalized === '4242424242424242' && card.expiry === '12/34' && card.cvv === '123') {
      this.logger.log(`Mock charge SUCCESS orderId=${orderId} amount=${amount}`);
      return { success: true, transactionId: `mock_txn_${Date.now()}` };
    }

    this.logger.warn(`Mock charge FAILED orderId=${orderId} reason=card_declined`);
    return { success: false, failureReason: 'card_declined' };
  }

  async refund(orderId: string, amount: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log(`Mock refund SUCCESS orderId=${orderId} amount=${amount}`);
    return { success: true };
  }
}
