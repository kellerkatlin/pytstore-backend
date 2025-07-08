import { Express } from './../node_modules/@types/express-serve-static-core/index.d';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/htpp-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);

  app.enableCors({
    origin: ['http://localhost:4200', 'https://admin.pyt-store.com'],
    credentials: true,
  });
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = process.env.PORT ?? 3000;
  await app.listen(port);


  // Banner simple sin chalk
  console.clear();
  console.log('\n' + '='.repeat(60));
  console.log('🚀  P&T Store');
  console.log(`🟢  Servidor corriendo en: http://localhost:${port}`);
  console.log(`🌱  Entorno: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`🕒  Hora de inicio: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');
}
bootstrap();
