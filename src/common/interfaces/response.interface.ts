export interface AppResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}
