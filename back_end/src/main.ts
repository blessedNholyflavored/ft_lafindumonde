import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { WsAdapter } from '@nestjs/platform-ws';
import { Server, Socket } from 'socket.io';
import * as http from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajouter le middleware CORS avant de configurer WebSocket
  app.enableCors();

  // Créer le serveur HTTP
  // const server = http.createServer(app.getHttpAdapter().getInstance());

  // Configurer l'adaptateur WebSocket
  const server = await app.listen(3000);

  // Configurer l'adaptateur WebSocket
  const io = new Server(server, {
    cors: {
      origin: '*', // Ou spécifiez l'origine de votre front-end ici
    },
  });
  // Configurer l'adaptateur WebSocket avant d'écouter les connexions
  app.useWebSocketAdapter(new WsAdapter(app));

  // Gérer les connexions WebSocket
  io.on('connection', (socket: Socket) => {
    console.log('Client connecté :', socket.id);
  
    // Écouter les événements côté client
    socket.on('sendMessage', (data: { username: string; message: string }) => {
      console.log(`${data.username}: ${data.message}`);
      
      // Envoyer le message reçu à tous les clients connectés
      io.emit('receiveMessage', { username: data.username, message: data.message });
    });
  
    // Écouter l'événement de déconnexion du client
    socket.on('disconnect', () => {
      console.log('Client déconnecté :', socket.id);
    });
  });

  // Récupérer le service Prisma
  app.get(PrismaService);

  // Lancer le serveur HTTP
  // await server.listen(3000);

  console.log('Serveur en cours d\'exécution sur le port 3000');
}

bootstrap();
