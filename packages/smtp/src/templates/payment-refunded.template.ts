export interface PaymentRefundedTemplateData {
  email: string;
  orderId: string;
  amount: number;
  currency: string;
}

export function paymentRefundedTemplate(data: PaymentRefundedTemplateData): { subject: string; html: string } {
  return {
    subject: `Refund Processed for Order #${data.orderId}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

        <tr><td style="background:#18181b;padding:32px 40px">
          <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:-0.5px">Saganet</h1>
        </td></tr>

        <tr><td style="padding:40px">
          <h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Refund Processed</h2>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            Hi <strong style="color:#18181b">${data.email}</strong>,
          </p>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            A refund has been processed for your order <strong style="color:#18181b">#${data.orderId}</strong>.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;width:100%;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden">
            <tr style="background:#f4f4f5">
              <td style="padding:12px 16px;font-weight:600;color:#18181b;font-size:14px">Order ID</td>
              <td style="padding:12px 16px;color:#52525b;font-size:14px;text-align:right">${data.orderId}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:600;color:#18181b;font-size:14px;border-top:1px solid #e4e4e7">Refunded Amount</td>
              <td style="padding:12px 16px;color:#18181b;font-size:14px;font-weight:600;text-align:right;border-top:1px solid #e4e4e7">${data.amount.toFixed(2)} ${data.currency}</td>
            </tr>
          </table>
          <p style="margin:0;color:#71717a;font-size:14px;line-height:1.5">
            The refund should appear in your account within 5-10 business days.
          </p>
        </td></tr>

        <tr><td style="background:#f4f4f5;padding:24px 40px;border-top:1px solid #e4e4e7">
          <p style="margin:0;color:#a1a1aa;font-size:12px">
            &copy; ${new Date().getFullYear()} Saganet. All rights reserved.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
