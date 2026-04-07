import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const req = context.switchToHttp().getRequest();
    const role = req.headers['x-user-role'] as string | undefined;
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!role || !userId) {
      throw new UnauthorizedException('Missing auth context');
    }

    if (!requiredRoles.includes(role as UserRole)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
