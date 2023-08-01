import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { WsAdapter } from '@nestjs/platform-ws';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(PrismaService);
  await app.listen(3000);
  app.useWebSocketAdapter(new WsAdapter(app)); // Activer le support des WebSockets


  // Ajouter le middleware CORS
  app.enableCors({
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  
}
bootstrap();
