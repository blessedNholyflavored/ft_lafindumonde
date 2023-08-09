import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { WsAdapter } from '@nestjs/platform-ws';
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import { UserService } from './user/user.service';
import { Room, User } from './interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajouter le middleware CORS avant de configurer WebSocket
  app.enableCors();

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
  const userService = app.get(UserService); // Obtenez une instance du service UserService

  // Gérer les connexions WebSocket
  const playerQueue: string[] = [];
  const playerQueue2: string[] = [];

  io.on('connection', (socket: Socket) => {
    console.log('Client connecté :', socket.id);
  
    socket.on('joinQueue', async (player: string) => {
      const username = await userService.findUsernameById(player);
      if (!playerQueue.includes(player)) {
        playerQueue.push(username);
        playerQueue2.push(username);
        console.log(`${username} a rejoint la file d'attente.`);
  
        const count = playerQueue.length;
        if (playerQueue.length === 2) {
          const firstPlayer = playerQueue.shift()!;
          const secondPlayer = playerQueue.shift()!;
          // io.to(user1.id.toString()).to(user2.id.toString()).emit('startGame', room);
  
          console.log(`Début du jeu entre ${firstPlayer} et ${secondPlayer}.`);
        }
  
        io.emit('queueUpdate', count);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('Client déconnecté :', socket.id);
      const index = playerQueue.indexOf(socket.id);
      if (index !== -1) {
        playerQueue.splice(index, 1);
        io.emit('queueUpdate', playerQueue);
      }
    });
  
    socket.on('startGame', (roomData: Room) => {
      const firstPlayer = playerQueue2.shift()!;
      const secondPlayer = playerQueue2.shift()!;

      const user1: User = { id: 1, username: firstPlayer };
      const user2: User = { id: 2, username: secondPlayer };

      const room: Room = { player1: user1, player2: user2 };
      console.log(room.player1);
      io.to(user1.id.toString()).to(user2.id.toString()).emit('startGame', room);
    });
    
    
    // ...
  });

  // Récupérer le service Prisma
  app.get(PrismaService);

  console.log('Serveur en cours d\'exécution sur le port 3000');
}

bootstrap();
