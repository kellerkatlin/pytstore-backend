import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { JwtPayload } from 'src/modules/auth/dto/jwt-payload.dto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const { method, originalUrl, ip, user } = req;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const email = user?.email ?? 'anon';
        console.log(
          `[${method}] ${originalUrl} - ${duration}ms - IP: ${ip} - User: ${email}`,
        );
      }),
    );
  }
}
