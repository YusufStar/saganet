# Notification Channels

## Overview

The notification service listens to Kafka events and sends email notifications via a BullMQ queue.

## Kafka Events & Templates

| Kafka Topic | Template | Description |
|---|---|---|
| `user.registered` | `verifyEmailTemplate` | Sends email verification link |
| `user.email-verified` | `welcomeTemplate` | Sends welcome email |
| `user.password-reset-requested` | `passwordResetTemplate` | Sends password reset link |
| `order.created` | `orderCreatedTemplate` | Order confirmation with total amount |
| `order.completed` | `orderCompletedTemplate` | Order completion notification |
| `order.failed` | `orderFailedTemplate` | Order failure notification with reason |
| `payment.completed` | `paymentCompletedTemplate` | Payment receipt with amount |
| `payment.refunded` | `paymentRefundedTemplate` | Refund confirmation with amount |

## Architecture

```
Kafka Event -> NotificationService (handler) -> BullMQ Queue -> NotificationProcessor -> Mailer (SMTP)
```

1. **NotificationService** subscribes to Kafka topics and parses event payloads
2. For each event, the corresponding email template is rendered
3. The email job is enqueued into the BullMQ `notifications` queue
4. **NotificationProcessor** picks up jobs and sends emails via the `Mailer`
5. Failed jobs are automatically retried by BullMQ

## How to Add a New Template

1. Create a new file in `packages/smtp/src/templates/`:
   ```ts
   export interface MyTemplateData {
     email: string;
     // ... other fields
   }

   export function myTemplate(data: MyTemplateData): { subject: string; html: string } {
     return {
       subject: 'Subject line',
       html: `<!DOCTYPE html>...`,
     };
   }
   ```

2. Export it from `packages/smtp/src/index.ts`:
   ```ts
   export * from './templates/my-template.template';
   ```

3. Import and use in `notification.service.ts`:
   - Add the Kafka topic subscription in `onApplicationBootstrap()`
   - Create a handler method that builds the template and calls `this.enqueue()`

## How to Add a New Channel

Currently only the **email** channel is implemented. To add a new channel (e.g. SMS, push notification):

1. Create a new processor class similar to `NotificationProcessor`
2. Register a new BullMQ queue for the channel
3. In `NotificationService`, decide which channel to use based on the event type and user preferences (stored in `notification_preferences` table)
4. Enqueue jobs to the appropriate queue

## Database Tables

### `notifications`
Stores a record of every notification sent. Fields: `id`, `userId`, `email`, `type`, `status`, `errorMessage`, `createdAt`, `sentAt`.

### `notification_preferences`
Stores per-user opt-in/opt-out preferences. Fields: `id`, `userId`, `channel`, `eventType`, `enabled`, `updatedAt`.
Unique constraint on `(userId, channel, eventType)`.
