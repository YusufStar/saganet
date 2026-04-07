import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(role?: string): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-user-role': role },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockContext('CUSTOMER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when role matches', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const context = createMockContext('ADMIN');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny when role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const context = createMockContext('CUSTOMER');
    expect(guard.canActivate(context)).toBe(false);
  });
});
