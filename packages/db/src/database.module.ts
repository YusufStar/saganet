import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createDataSource, DatabaseConfig } from './data-source';

export const DATA_SOURCE = 'DATA_SOURCE';

@Injectable()
class DatabaseShutdownService implements OnApplicationShutdown {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig = {}): DynamicModule {
    const dataSourceProvider = {
      provide: DATA_SOURCE,
      useFactory: async (): Promise<DataSource> => {
        const ds = createDataSource(config);
        await ds.initialize();
        return ds;
      },
    };

    return {
      module: DatabaseModule,
      global: true,
      providers: [dataSourceProvider, DatabaseShutdownService],
      exports: [DATA_SOURCE],
    };
  }
}
