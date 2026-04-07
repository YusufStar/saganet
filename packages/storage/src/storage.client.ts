import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageConfig {
  endpoint?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

export interface UploadOptions {
  key: string;
  buffer: Buffer;
  contentType: string;
  bucket?: string;
}

export class StorageClient {
  private readonly s3: S3Client;
  private readonly defaultBucket: string;
  private readonly publicUrl: string;

  constructor(config: StorageConfig = {}) {
    const endpoint = config.endpoint ?? process.env.MINIO_ENDPOINT ?? 'http://localhost:9000';
    const region = config.region ?? process.env.MINIO_REGION ?? 'us-east-1';
    const accessKeyId = config.accessKeyId ?? process.env.MINIO_ACCESS_KEY ?? 'minioadmin';
    const secretAccessKey = config.secretAccessKey ?? process.env.MINIO_SECRET_KEY ?? 'minioadmin';

    this.defaultBucket = config.bucket ?? process.env.MINIO_BUCKET ?? 'saganet';
    this.publicUrl = config.publicUrl ?? process.env.MINIO_PUBLIC_URL ?? endpoint;

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: config.forcePathStyle ?? true, // required for MinIO
    });
  }

  async upload(options: UploadOptions): Promise<string> {
    const bucket = options.bucket ?? this.defaultBucket;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: options.key,
        Body: options.buffer,
        ContentType: options.contentType,
      }),
    );

    return `${this.publicUrl}/${bucket}/${options.key}`;
  }

  async delete(key: string, bucket?: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket ?? this.defaultBucket,
        Key: key,
      }),
    );
  }

  async getPresignedUrl(key: string, expiresIn = 3600, bucket?: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket ?? this.defaultBucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }
}

export function createStorageClient(config: StorageConfig = {}): StorageClient {
  return new StorageClient(config);
}
