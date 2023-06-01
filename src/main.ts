import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createMidjourney } from './midjourney/midjourney.service';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception';
import 'reflect-metadata';

const isProd = process.env.NODE_ENV === 'production';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (isProd) {
    await createMidjourney();
  }
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.enableCors();
  await app.listen(8999);
}
bootstrap();
