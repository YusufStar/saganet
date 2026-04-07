export interface VerifyEmailTemplateData {
  email: string;
  verificationUrl: string;
  expiresInHours?: number;
}

export function verifyEmailTemplate(data: VerifyEmailTemplateData): { subject: string; html: string } {
  const expires = data.expiresInHours ?? 24;

  return {
    subject: 'E-posta Adresinizi Doğrulayın — Saganet',
    html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr><td style="background:#18181b;padding:32px 40px">
          <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:-0.5px">Saganet</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px">
          <h2 style="margin:0 0 16px;color:#18181b;font-size:20px">E-postanızı Doğrulayın</h2>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            Merhaba, <strong style="color:#18181b">${data.email}</strong>
          </p>
          <p style="margin:0 0 32px;color:#52525b;line-height:1.6">
            Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın.
            Bu bağlantı <strong>${expires} saat</strong> geçerlidir.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr><td style="background:#18181b;border-radius:6px">
              <a href="${data.verificationUrl}"
                 style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px">
                E-postamı Doğrula
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#71717a;font-size:13px">Buton çalışmıyorsa aşağıdaki bağlantıyı kopyalayın:</p>
          <p style="margin:0;color:#3b82f6;font-size:13px;word-break:break-all">
            <a href="${data.verificationUrl}" style="color:#3b82f6">${data.verificationUrl}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f4f4f5;padding:24px 40px;border-top:1px solid #e4e4e7">
          <p style="margin:0;color:#a1a1aa;font-size:12px">
            Bu e-postayı siz talep etmediyseniz dikkate almayınız. Hesabınız güvende.
            <br>&copy; ${new Date().getFullYear()} Saganet.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
