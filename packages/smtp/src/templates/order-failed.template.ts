export interface OrderFailedTemplateData {
  email: string;
  orderId: string;
  reason?: string;
}

export function orderFailedTemplate(data: OrderFailedTemplateData): { subject: string; html: string } {
  const reason = data.reason ?? 'An unexpected error occurred while processing your order.';

  return {
    subject: `Order #${data.orderId} Could Not Be Processed`,
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
          <h2 style="margin:0 0 16px;color:#dc2626;font-size:20px">Order Failed</h2>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            Hi <strong style="color:#18181b">${data.email}</strong>,
          </p>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            Unfortunately, your order <strong style="color:#18181b">#${data.orderId}</strong> could not be processed.
          </p>
          <p style="margin:0 0 24px;color:#52525b;line-height:1.6">
            <strong>Reason:</strong> ${reason}
          </p>
          <p style="margin:0;color:#71717a;font-size:14px;line-height:1.5">
            Please try again or contact our support team if the issue persists.
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
