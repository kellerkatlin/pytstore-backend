import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/modules/auth/dto/jwt-payload.dto';

export const ActiveUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request: Request & { user?: JwtPayload } = ctx
      .switchToHttp()
      .getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
