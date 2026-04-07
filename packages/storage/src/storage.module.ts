import { DynamicModule, Module } from '@nestjs/common';
import { StorageClient, StorageConfig, createStorageClient } from './storage.client';

export const STORAGE_CLIENT = 'STORAGE_CLIENT';

@Module({})
export class StorageModule {
  static forRoot(config: StorageConfig = {}): DynamicModule {
    const storageProvider = {
      provide: STORAGE_CLIENT,
      useFactory: (): StorageClient => createStorageClient(config),
    };

    return {
      module: StorageModule,
      global: true,
      providers: [storageProvider],
      exports: [STORAGE_CLIENT],
    };
  }
}
