import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { RateLimiterService } from '../src/auth/rate-limiter.service';

// Mock the logger
jest.mock('@saganet/observability', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), trace: jest.fn(), fatal: jest.fn() },
}));

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let savedUsers: Map<string, any>;
  let savedSessions: Map<string, any>;
  let savedOutbox: any[];
  let mockRedisStore: Map<string, string>;
  let mockRedisSets: Map<string, Set<string>>;
  let mockDataSource: any;
  let mockRedis: any;

  beforeAll(async () => {
    savedUsers = new Map();
    savedSessions = new Map();
    savedOutbox = [];
    mockRedisStore = new Map();
    mockRedisSets = new Map();

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn().mockImplementation((_entity: any, data: any) => {
          const id = data.id ?? randomUUID();
          const record = { id, createdAt: new Date(), ...data };
          const entityName = typeof _entity === 'function' ? _entity.name : _entity;
          if (entityName === 'UserEntity') {
            savedUsers.set(id, record);
          } else if (entityName === 'UserSessionEntity') {
            savedSessions.set(id, record);
          } else {
            savedOutbox.push(record);
          }
          return Promise.resolve(record);
        }),
        update: jest.fn().mockImplementation((_entity: any, id: string, data: any) => {
          const entityName = typeof _entity === 'function' ? _entity.name : _entity;
          if (entityName === 'UserEntity') {
            const user = savedUsers.get(id);
            if (user) savedUsers.set(id, { ...user, ...data });
          }
          return Promise.resolve({});
        }),
      },
    };

    mockDataSource = {
      getRepository: jest.fn().mockImplementation((entity: any) => {
        const entityName = typeof entity === 'function' ? entity.name : entity;
        return {
          findOne: jest.fn().mockImplementation(({ where }: any) => {
            if (entityName === 'UserEntity') {
              for (const [, user] of savedUsers) {
                for (const [key, val] of Object.entries(where)) {
                  if (user[key] === val) return Promise.resolve(user);
                }
              }
            }
            if (entityName === 'UserSessionEntity') {
              if (where.id) return Promise.resolve(savedSessions.get(where.id) ?? null);
            }
            return Promise.resolve(null);
          }),
          update: jest.fn().mockImplementation((id: string, data: any) => {
            if (entityName === 'UserEntity') {
              const user = savedUsers.get(id);
              if (user) savedUsers.set(id, { ...user, ...data });
            }
            return Promise.resolve({});
          }),
          save: jest.fn().mockImplementation((data: any) => {
            const id = data.id ?? randomUUID();
            const record = { id, createdAt: new Date(), ...data };
            if (entityName === 'UserSessionEntity') {
              savedSessions.set(id, record);
            }
            return Promise.resolve(record);
          }),
          createQueryBuilder: jest.fn().mockReturnValue({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({}),
          }),
        };
      }),
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    mockRedis = {
      get: jest.fn().mockImplementation((key: string) => Promise.resolve(mockRedisStore.get(key) ?? null)),
      set: jest.fn().mockImplementation((key: string, value: string) => {
        mockRedisStore.set(key, value);
        return Promise.resolve('OK');
      }),
      del: jest.fn().mockImplementation((key: string) => {
        mockRedisStore.delete(key);
        return Promise.resolve(1);
      }),
      sadd: jest.fn().mockImplementation((key: string, member: string) => {
        if (!mockRedisSets.has(key)) mockRedisSets.set(key, new Set());
        mockRedisSets.get(key)!.add(member);
        return Promise.resolve(1);
      }),
      srem: jest.fn().mockImplementation((key: string, member: string) => {
        mockRedisSets.get(key)?.delete(member);
        return Promise.resolve(1);
      }),
      smembers: jest.fn().mockImplementation((key: string) => {
        return Promise.resolve(Array.from(mockRedisSets.get(key) ?? []));
      }),
      expire: jest.fn().mockResolvedValue(1),
      pipeline: jest.fn().mockReturnValue({
        incr: jest.fn(),
        ttl: jest.fn(),
        exec: jest.fn().mockResolvedValue([[null, 1], [null, -1]]),
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [() => ({ JWT_SECRET: 'test-secret-key-for-e2e' })] }),
        JwtModule.registerAsync({
          useFactory: () => ({
            secret: 'test-secret-key-for-e2e',
            signOptions: { expiresIn: '15m' },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        RateLimiterService,
        { provide: 'DATA_SOURCE', useValue: mockDataSource },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  let cookies: string[];

  it('POST /auth/register - should create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@example.com', password: 'TestPass1!' })
      .expect(201);

    expect(res.body.message).toContain('Registration successful');
    expect(res.body.user.email).toBe('e2e@example.com');
  });

  it('POST /auth/register - should reject duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@example.com', password: 'TestPass1!' })
      .expect(409);
  });

  it('POST /auth/login - should reject unverified email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@example.com', password: 'TestPass1!' })
      .expect(403);
  });

  it('GET /auth/verify-email - should verify email', async () => {
    const outboxEvent = savedOutbox.find((o: any) => o.payload?.email === 'e2e@example.com');
    expect(outboxEvent).toBeDefined();
    const token = outboxEvent.payload.verificationToken;

    await request(app.getHttpServer())
      .get(`/auth/verify-email?token=${token}`)
      .expect(200);
  });

  it('POST /auth/login - should succeed after verification', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@example.com', password: 'TestPass1!' })
      .expect(200);

    expect(res.body.access_token).toBeDefined();
    cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
  });

  it('POST /auth/logout - should clear session', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookies)
      .expect(204);
  });
});
