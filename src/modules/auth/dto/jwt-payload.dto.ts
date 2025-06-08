import { RoleName } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string | null;
  role: RoleName;
}
