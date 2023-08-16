import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';
import { Room, User } from 'src/interfaces';

@WebSocketGateway(
  { cors: ["*"], origin: ["*"], path: "", }

)

export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  private playerQueue: number[] = [];
  private playerQueue2: number[] = [];
  private res;
  private p1;
  private p2;
  constructor(private readonly gameService: GameService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }
  

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }

  @SubscribeMessage('joinQueue')
  async onJoinQueue(@MessageBody() player: number, @ConnectedSocket() socket: Socket,){
    if (!this.playerQueue.includes(player)) {
      this.playerQueue.push(player);
      this.playerQueue2.push(player);
      console.log(`${player} a rejoint la file d'attente.`);

      const count = this.playerQueue.length;
      if (this.playerQueue.length === 2) {
        const firstPlayer = this.playerQueue.shift()!;
        const secondPlayer = this.playerQueue.shift()!;

        // io.to(user1.id.toString()).to(user2.id.toString()).emit('startGame', room);

        console.log(`Début du jeu entre ${firstPlayer} et ${secondPlayer}.`);
        this.res = await this.gameService.CreateGame(firstPlayer, secondPlayer);
        this.p1 = firstPlayer;
        this.p2 = secondPlayer;
      }

      this.server.emit('queueUpdate', count);
    }
  }

  @SubscribeMessage('startGame')
  async onStartGame(@MessageBody() roonData: Room, id: number, @ConnectedSocket() socket: Socket,)
  {
    const firstPlayer = this.playerQueue2.shift()!;
      const secondPlayer = this.playerQueue2.shift()!;
      // const username1 = await userService.findUsernameById(firstPlayer.toString());
      // const username2 = await userService.findUsernameById(secondPlayer.toString());
      
      
      
      const user1: User = { id: this.p1, username: "test1", point: { x: 0, y: 200 }, socketid: '' };
      const user2: User = { id: this.p2, username: "test2", point: { x: 700, y: 200 }, socketid: '' };
      
      const room: Room = { player1: user1, player2: user2, ball: {
        x: 350, y: 200, speedX: -5, speedY: 0, speed: 5,
        radius: 0
      }, idRoom: this.res.id, scorePlayer1: 0, scorePlayer2: 0, end: 0, winner: null, idP1: this.p1, idP2: this.p2 };
      this.server.emit('startGame2', room);
  }

  @SubscribeMessage('movePoint')
  async onMovePlayer(@MessageBody() data: number, keycode: string, room: Room, @ConnectedSocket() socket: Socket,)
  {
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
    this.server.emit('recupMoov', room);
  }

  @SubscribeMessage('ballMoovEMIT')
  async onMoveBall(@MessageBody()room: Room, @ConnectedSocket() socket: Socket,)
  {
    if (room && room.ball)
    {
    room.ball.x += room.ball.speedX;
    room.ball.y += room.ball.speedY;

    const canvasWidth = 700;
    const canvasHeight = 400;
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
      this.gameService.updateGame(room);
      room.end = 1;
    }
  
    this.server.emit('ballMoovON', room);
  }
  }
}