import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, AppResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<AppResponse<T>> {
    return next.handle().pipe(
      map((data: T | AppResponse<T>): AppResponse<T> => {
        // Si ya es una respuesta con el formato estándar, se devuelve tal cual
        if (
          typeof data === 'object' &&
          data !== null &&
          'success' in data &&
          'data' in data &&
          'statusCode' in data
        ) {
          return data;
        }

        // Si no, lo convierte al formato estándar
        return {
          success: true,
          data,
          message: '',
          statusCode: 200,
        };
      }),
    );
  }
}
