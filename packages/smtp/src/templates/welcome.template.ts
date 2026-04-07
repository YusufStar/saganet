export interface WelcomeTemplateData {
  email: string;
}

export function welcomeTemplate(data: WelcomeTemplateData): { subject: string; html: string } {
  return {
    subject: "Saganet'e Hoş Geldiniz!",
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
          <h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Hoş Geldiniz! 🎉</h2>
          <p style="margin:0 0 12px;color:#52525b;line-height:1.6">
            <strong style="color:#18181b">${data.email}</strong> adresiyle Saganet'e başarıyla kayıt oldunuz.
          </p>
          <p style="margin:0 0 24px;color:#52525b;line-height:1.6">
            Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.
            Doğrulama e-postası ayrıca gönderilmiştir.
          </p>
          <p style="margin:0;color:#71717a;font-size:14px;line-height:1.5">
            Bu e-postayı beklemiyorsanız dikkate almayınız.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f4f4f5;padding:24px 40px;border-top:1px solid #e4e4e7">
          <p style="margin:0;color:#a1a1aa;font-size:12px">
            &copy; ${new Date().getFullYear()} Saganet. Tüm hakları saklıdır.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
