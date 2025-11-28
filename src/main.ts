import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. ¡Dile a Nest que use el traductor!
  // Esto lee el JSON, lo valida con tu DTO y evita el error 'undefined'
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // No deja pasar propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Manda error si hay propiedades extra
    }),
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 3. No olvides el CORS para que Ionic se conecte
  app.enableCors({
    credentials: true
  });

  await app.listen(3000);
}
bootstrap();