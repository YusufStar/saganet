export interface VerifyEmailTemplateData {
  email: string;
  verificationUrl: string;
  expiresInHours?: number;
}

export function verifyEmailTemplate(data: VerifyEmailTemplateData): { subject: string; html: string } {
  const expires = data.expiresInHours ?? 24;

  return {
    subject: 'Verify your email address — Saganet',
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
          <h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Verify your email address</h2>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            Hi <strong style="color:#18181b">${data.email}</strong>,
          </p>
          <p style="margin:0 0 32px;color:#52525b;line-height:1.6">
            Click the button below to verify your email address. This link expires in <strong>${expires} hours</strong>.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr><td style="background:#18181b;border-radius:6px">
              <a href="${data.verificationUrl}"
                 style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px">
                Verify Email Address
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#71717a;font-size:13px">If the button doesn't work, copy and paste the link below:</p>
          <p style="margin:0;color:#3b82f6;font-size:13px;word-break:break-all">
            <a href="${data.verificationUrl}" style="color:#3b82f6">${data.verificationUrl}</a>
          </p>
        </td></tr>

        <tr><td style="background:#f4f4f5;padding:24px 40px;border-top:1px solid #e4e4e7">
          <p style="margin:0;color:#a1a1aa;font-size:12px">
            If you didn't create a Saganet account, you can safely ignore this email.
            <br>&copy; ${new Date().getFullYear()} Saganet. All rights reserved.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
