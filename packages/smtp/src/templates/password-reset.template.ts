export interface PasswordResetTemplateData {
  email: string;
  resetUrl: string;
  expiresInHours?: number;
}

export function passwordResetTemplate(data: PasswordResetTemplateData): { subject: string; html: string } {
  const expires = data.expiresInHours ?? 1;

  return {
    subject: 'Reset your password — Saganet',
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
          <h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Reset your password</h2>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            Hi <strong style="color:#18181b">${data.email}</strong>,
          </p>
          <p style="margin:0 0 32px;color:#52525b;line-height:1.6">
            We received a request to reset your password. Click the button below to choose a new password. This link expires in <strong>${expires} hour${expires === 1 ? '' : 's'}</strong>.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr><td style="background:#18181b;border-radius:6px">
              <a href="${data.resetUrl}"
                 style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px">
                Reset Password
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#71717a;font-size:13px">If the button doesn't work, copy and paste the link below:</p>
          <p style="margin:0 0 24px;color:#3b82f6;font-size:13px;word-break:break-all">
            <a href="${data.resetUrl}" style="color:#3b82f6">${data.resetUrl}</a>
          </p>
          <p style="margin:0;color:#71717a;font-size:14px;line-height:1.5">
            If you did not request a password reset, you can safely ignore this email.
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
