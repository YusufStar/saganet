export interface ChargeResult {
  success: boolean;
  transactionId?: string;
  failureReason?: string;
}

export interface PaymentProvider {
  charge(orderId: string, amount: string, card: CardDetails): Promise<ChargeResult>;
  refund(orderId: string, amount: string): Promise<{ success: boolean }>;
}

export interface CardDetails {
  number: string;
  expiry: string; // MM/YY
  cvv: string;
}
