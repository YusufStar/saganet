import * as nodemailer from 'nodemailer';

export interface MailerConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export class Mailer {
  private readonly transporter: nodemailer.Transporter;
  readonly from: string;

  constructor(config: MailerConfig = {}) {
    this.from = config.from ?? process.env.SMTP_FROM ?? 'noreply@saganet.com';

    this.transporter = nodemailer.createTransport({
      host: config.host ?? process.env.SMTP_HOST ?? 'localhost',
      port: config.port ?? parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: config.secure ?? process.env.SMTP_SECURE === 'true',
      auth: {
        user: config.user ?? process.env.SMTP_USER,
        pass: config.password ?? process.env.SMTP_PASSWORD,
      },
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
