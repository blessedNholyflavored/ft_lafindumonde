import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
//import { MulterModule } from '@nestjs/platform-express';
//import { diskStorage } from 'multer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(PrismaService);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
