import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { RateLimiterService } from '../rate-limiter.service';
import { UserRole } from '../../users/user-role.enum';

// Mock the logger
jest.mock('@saganet/observability', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), trace: jest.fn(), fatal: jest.fn() },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockDataSource: any;
  let mockRedis: any;
  let mockJwtService: any;
  let mockRateLimiter: any;

  // Shared mock repos
  let mockUserRepo: any;
  let mockSessionRepo: any;
  let mockQueryRunner: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockSessionRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue({ id: 'session-id', userId: 'user-id', familyId: 'family-id' }),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn().mockImplementation((_entity, data) => Promise.resolve({ id: 'new-id', ...data })),
        update: jest.fn(),
      },
    };

    mockDataSource = {
      getRepository: jest.fn((entity: any) => {
        if (entity.name === 'UserEntity') return mockUserRepo;
        if (entity.name === 'UserSessionEntity') return mockSessionRepo;
        return mockUserRepo;
      }),
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      sadd: jest.fn(),
      srem: jest.fn(),
      smembers: jest.fn().mockResolvedValue([]),
      expire: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: 'user-id', role: 'CUSTOMER', sessionId: 'session-id' }),
    };

    mockRateLimiter = {
      checkLoginRateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 10, retryAfterSeconds: 0 }),
      onLoginSuccess: jest.fn(),
    };

    authService = new AuthService(
      mockDataSource,
      mockRedis,
      mockJwtService as unknown as JwtService,
      mockRateLimiter as unknown as RateLimiterService,
    );
  });

  describe('register', () => {
    it('should throw ConflictException for duplicate email', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

      await expect(
        authService.register({ email: 'test@example.com', password: 'Secure123!' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password with bcrypt on register', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await authService.register({ email: 'new@example.com', password: 'Secure123!' });

      const savedCall = mockQueryRunner.manager.save.mock.calls[0];
      const savedUser = savedCall[1];
      expect(savedUser.passwordHash).toBeDefined();
      expect(await bcrypt.compare('Secure123!', savedUser.passwordHash)).toBe(true);
      expect(result.message).toContain('Registration successful');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const { createHash } = require('crypto');
      const token = 'valid-token-uuid';
      const tokenHash = createHash('sha256').update(token).digest('hex');

      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        emailVerified: false,
        verificationTokenHash: tokenHash,
        verificationTokenExpiresAt: new Date(Date.now() + 60000),
      });

      const result = await authService.verifyEmail(token);
      expect(result.message).toContain('Email verified');
    });

    it('should throw for expired token', async () => {
      const { createHash } = require('crypto');
      const token = 'expired-token';
      const tokenHash = createHash('sha256').update(token).digest('hex');

      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        emailVerified: false,
        verificationTokenHash: tokenHash,
        verificationTokenExpiresAt: new Date(Date.now() - 60000), // expired
      });

      await expect(authService.verifyEmail(token)).rejects.toThrow('Verification token has expired');
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'Secure123!' };
    const ip = '127.0.0.1';
    const userAgent = 'test-agent';

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('DifferentPassword1!', 10);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash,
        emailVerified: true,
        failedLoginAttempts: 0,
        role: UserRole.CUSTOMER,
      });

      await expect(authService.login(loginDto, ip, userAgent)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for unverified email', async () => {
      const passwordHash = await bcrypt.hash('Secure123!', 10);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash,
        emailVerified: false,
        failedLoginAttempts: 0,
        role: UserRole.CUSTOMER,
      });

      await expect(authService.login(loginDto, ip, userAgent)).rejects.toThrow(ForbiddenException);
    });

    it('should return access token on successful login', async () => {
      const passwordHash = await bcrypt.hash('Secure123!', 10);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash,
        emailVerified: true,
        failedLoginAttempts: 0,
        role: UserRole.CUSTOMER,
      });

      const result = await authService.login(loginDto, ip, userAgent);

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.sessionId).toBeDefined();
      expect(result.rawRefreshToken).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should return user info for valid session', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({
        userId: 'user-id',
        role: 'CUSTOMER',
        sessionId: 'session-id',
      }));

      const result = await authService.verifyToken('session-id', 'valid-jwt');

      expect(result.userId).toBe('user-id');
      expect(result.role).toBe('CUSTOMER');
      expect(result.sessionId).toBe('session-id');
    });

    it('should throw UnauthorizedException for expired session', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(authService.verifyToken('invalid-session', 'valid-jwt')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid JWT', async () => {
      mockJwtService.verify.mockImplementation(() => { throw new Error('invalid'); });

      await expect(authService.verifyToken('session-id', 'bad-jwt')).rejects.toThrow(UnauthorizedException);
    });
  });
});
