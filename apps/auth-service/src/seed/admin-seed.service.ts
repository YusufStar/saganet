import { Injectable, Logger, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DATA_SOURCE } from '@saganet/db';
import { UserEntity } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed');
      return;
    }

    const repo = this.dataSource.getRepository(UserEntity);

    // Only 1 admin can exist
    const existing = await repo.findOne({ where: { role: UserRole.ADMIN } });
    if (existing) {
      this.logger.log(`Admin user already exists (${existing.email}) — skipping seed`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await repo.save({
      email,
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,   // auto-verified — no email flow needed
      failedLoginAttempts: 0,
    });

    this.logger.log(`Admin user created: ${email}`);
  }
}
