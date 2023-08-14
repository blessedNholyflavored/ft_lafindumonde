import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { WsAdapter } from '@nestjs/platform-ws';
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import { UserService } from './user/user.service';
import { Room, User } from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import { networkInterfaces } from 'os';
import * as cookieParser from 'cookie-parser';
import { GameService } from './game/game.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(PrismaService);

  // Ajouter le middleware CORS avant de configurer WebSocket
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true,
  });
  app.use(cookieParser());


  // Configurer l'adaptateur WebSocket
  const server = await app.listen(3000);


  // Configurer l'adaptateur WebSocket
  const io = new Server(server, {
    cors: {
      origin: '*', // Ou spécifiez l'origine de votre front-end ici
     credentials: true,
    },
  });

  // Configurer l'adaptateur WebSocket avant d'écouter les connexions
  app.useWebSocketAdapter(new WsAdapter(app));
  
  const userService = app.get(UserService); // Obtenez une instance du service UserService
  const gameService = app.get(GameService); // Obtenez une instance du service UserService

  // Gérer les connexions WebSocket
  const playerQueue: number[] = [];
  const playerQueue2: number[] = [];
  let res;
  let p1;
  let p2;


  io.on('connection', (socket: Socket) => {
    console.log('Client connecté :', socket.id);
  
    socket.on('joinQueue', async (player: number) => {
      if (!playerQueue.includes(player)) {
        playerQueue.push(player);
        playerQueue2.push(player);
        console.log(`${player} a rejoint la file d'attente.`);
  
        const count = playerQueue.length;
        if (playerQueue.length === 2) {
          const firstPlayer = playerQueue.shift()!;
          const secondPlayer = playerQueue.shift()!;

          // io.to(user1.id.toString()).to(user2.id.toString()).emit('startGame', room);
  
          console.log(`Début du jeu entre ${firstPlayer} et ${secondPlayer}.`);
          res = await gameService.CreateGame(firstPlayer, secondPlayer);
          p1 = firstPlayer;
          p2 = secondPlayer;
        }
  
        io.emit('queueUpdate', count);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('Client déconnecté :', socket.id);
      const index = playerQueue.indexOf(parseInt(socket.id));
      if (index !== -1) {
        playerQueue.splice(index, 1);
        io.emit('queueUpdate', playerQueue);
      }
    });
  
    socket.on('startGame', async (roomData: Room, id: number) => {
      const firstPlayer = playerQueue2.shift()!;
      const secondPlayer = playerQueue2.shift()!;
      // const username1 = await userService.findUsernameById(firstPlayer.toString());
      // const username2 = await userService.findUsernameById(secondPlayer.toString());
      
      
      
      const user1: User = { id: p1, username: "test1", point: { x: 0, y: 200 }, socketid: '' };
      const user2: User = { id: p2, username: "test2", point: { x: 700, y: 200 }, socketid: '' };
      
      const room: Room = { player1: user1, player2: user2, ball: {
        x: 350, y: 200, speedX: -5, speedY: 0, speed: 5,
        radius: 0
      }, idRoom: res.id, scorePlayer1: 0, scorePlayer2: 0, end: 0, winner: null, idP1: p1, idP2: p2 };
      io.emit('startGame2', room);
    });

    socket.on('movePoint', (data: number, keycode: string, room: Room) => {

    if (keycode === 'ArrowUp')
    {
      if (room.player1.id === data)
      {
        if (room.player1.point.y - 10 > -10)
          room.player1.point.y -= 10;
      }
      else if (room.player2.id === data)
      {
        if (room.player2.point.y - 10 > -10)
          room.player2.point.y -= 10;
      }
    }
    else if (keycode === 'ArrowDown')
    {
      if (room.player1.id === data)
      {
        if (room.player1.point.y + 10 < 330)
         room.player1.point.y += 10;
      }
      else if (room.player2.id === data)
      {
        if (room.player2.point.y + 10 < 330)
          room.player2.point.y += 10;
      }
    }
    io.emit('recupMoov', room);

    // io.to(room.player1.socketid).emit('recupMoov', room);
    // io.to(room.player2.socketid).emit('recupMoov', room);
  });

  const canvasWidth = 700; // Remplacez par la largeur de votre zone de jeu
  const canvasHeight = 400; // Remplacez par la hauteur de votre zone de jeu

  
  socket.on('ballMoovEMIT', async (room: Room) => {
    room.ball.x += room.ball.speedX;
    room.ball.y += room.ball.speedY;
  
    const leftPaddle = room.player1;
    const rightPaddle = room.player2;
  
    // Condition de rebond sur la raquette du joueur 1 (gauche)
    if (
      room.ball.x <= leftPaddle.point.x + 10 &&
      room.ball.y >= leftPaddle.point.y &&
      room.ball.y <= leftPaddle.point.y + 80
    ) {
      const relativeY = (room.ball.y - leftPaddle.point.y) / 80; // Calcul de la position relative sur la raquette
      room.ball.speedX = -room.ball.speedX;
      room.ball.speedY = relativeY * 5 - 1; // Angle en fonction de la position relative
    }
  
    // Condition de rebond sur la raquette du joueur 2 (droite)
    if (
      room.ball.x >= rightPaddle.point.x - 10 &&
      room.ball.y >= rightPaddle.point.y &&
      room.ball.y <= rightPaddle.point.y + 80
    ) {
      const relativeY = (room.ball.y - rightPaddle.point.y) / 80; // Calcul de la position relative sur la raquette
      room.ball.speedX = -room.ball.speedX;
      room.ball.speedY = relativeY * 5 - 1; // Angle en fonction de la position relative
    }
  
    // Condition de rebond sur le mur haut
    if (room.ball.y <= room.ball.radius) {
      room.ball.speedY = -room.ball.speedY;
    }
  
    // Condition de rebond sur le mur bas
    if (room.ball.y >= canvasHeight - room.ball.radius) {
      room.ball.speedY = -room.ball.speedY;
    }
  
    // Condition de rebond sur les murs gauche et droit
    if (room.ball.x <= 0)
    {
      room.ball.x = canvasWidth / 2;
      room.ball.y = canvasHeight / 2;
      room.ball.speedX = -room.ball.speedX;
      room.scorePlayer2 += 1;
    }
    if (room.ball.x >= canvasWidth) {
      room.ball.x = canvasWidth / 2;
      room.ball.y = canvasHeight / 2;
      room.ball.speedX = -room.ball.speedX;
      room.scorePlayer1 += 1;
    }
    if (room.scorePlayer1 == 3 || room.scorePlayer2 == 3)
    {
      if (room.scorePlayer1 == 3)
      {
        room.winner = room.player1.username;
        room.winnerid = room.idP1;

      }
      else
      {
        room.winner = room.player2.username;
        room.winnerid = room.idP2;

      }
      gameService.updateGame(room);
      room.end = 1;
    }
  
    io.emit('ballMoovON', room);
  });
  
  // socket.on('UpdateGame', async (room: Room) => {
  //   if (room.player1 && room.player1.id) {
  //     gameService.CreateGame(room);
  //   } else {
  //     console.log('Invalid room data:', room);
  //   }
  // });
  


    
  });

  // Récupérer le service Prisma

  console.log('Serveur en cours d\'exécution sur le port 3000');
}

bootstrap();
