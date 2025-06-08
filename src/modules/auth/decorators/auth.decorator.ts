import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';

/**
 * Custom decorator to apply authentication and role-based authorization guards to route handlers.
 *
 * @param roles  - A list of role names that are allowed to access the route.
 * @returns A method decorator that sets the required roles metadata and applies both `AuthGuard` and `RolesGuard`.
 *
 * @example
 * ```typescript
 * @Auth('admin', 'user')
 * @Get('profile')
 * getProfile() { ... }
 * ```
 */
export function Auth(...roles: RoleName[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(AuthGuard, RolesGuard),
  );
}
