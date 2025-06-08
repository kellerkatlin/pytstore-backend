import { HttpStatus } from '@nestjs/common';

// src/common/helpers/response.helper.ts
export function ok<T>(data: T, message = '', statusCode = HttpStatus.OK) {
  return {
    success: true,
    data,
    message,
    statusCode,
  };
}

export function created<T>(data: T, message = 'Recurso creado') {
  return {
    success: true,
    data,
    message,
    statusCode: HttpStatus.CREATED,
  };
}

export function paginated<T>(
  data: T[],
  meta: { total: number; page: number; lastPage: number },
  message = 'Listado obtenido correctamente',
) {
  return {
    success: true,
    data: {
      data,
      meta,
    },
    message,
    statusCode: HttpStatus.OK,
  };
}
