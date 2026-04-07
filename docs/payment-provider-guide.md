# Payment Service — Mock Provider Guide

## Test Card (Mock Provider)
| Field  | Value                |
|--------|----------------------|
| Number | 4242 4242 4242 4242  |
| Expiry | 12/34                |
| CVV    | 123                  |

Any other card → `card_declined` failure.

## Webhook Simulation
POST /api/payments/webhook/simulate
{ "orderId": "<uuid>", "success": true|false }

## Adding a Real Provider
1. Implement `PaymentProvider` interface in `src/payment/providers/`
2. Set `PAYMENT_PROVIDER=stripe` in env
3. Update `PaymentModule` to use env-selected provider
