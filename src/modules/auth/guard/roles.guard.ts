import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from 'src/modules/auth/dto/jwt-payload.dto';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    if (!user) {
      throw new ForbiddenException('No se encontró un usuario en la solicitud');
    }
    if (user.role === 'SUPERADMIN') return true;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `El usuario no tiene los roles requeridos: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
