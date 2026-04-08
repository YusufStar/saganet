import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';
import type { RefundPaymentRequest } from '@/lib/api/types';
import { paymentKeys } from './query-keys';

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: RefundPaymentRequest }) =>
      paymentsApi.admin.refund(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: paymentKeys.byOrder(id) });
      qc.invalidateQueries({ queryKey: paymentKeys.adminList() });
    },
  });
}
