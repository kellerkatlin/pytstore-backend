import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/modules/auth/dto/jwt-payload.dto';

export const ActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user?: JwtPayload } = ctx
      .switchToHttp()
      .getRequest();
    return request.user;
  },
);
