import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Mailer, MailerConfig } from './mailer';

export const MAILER = 'MAILER';

@Injectable()
class MailerShutdownService implements OnApplicationShutdown {
  constructor(@Inject(MAILER) private readonly mailer: Mailer) {}

  async onApplicationShutdown(): Promise<void> {
    // nodemailer transporter'ın açık bağlantılarını kapat
    (this.mailer as any).transporter?.close?.();
  }
}

@Module({})
export class MailerModule {
  static forRoot(config: MailerConfig = {}): DynamicModule {
    return {
      module: MailerModule,
      global: true,
      providers: [
        {
          provide: MAILER,
          useFactory: () => new Mailer(config),
        },
        MailerShutdownService,
      ],
      exports: [MAILER],
    };
  }
}
