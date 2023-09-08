// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { WebsocketProvider } from './gateway/socket.provider';
import { PrismaService } from './prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import * as http from 'http'; // Importez le type http.Server

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(PrismaService);
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
