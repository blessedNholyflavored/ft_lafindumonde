import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server} from 'socket.io';
// ici on import le type Socket qui extends socket de socket.io mais avec l'user
import Socket from 'src/gateway/types/socket';
import { GameService } from 'src/game/game.service';
import { Room, User, roomSend } from 'src/interfaces';
import { UserService } from 'src/user/user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guards';
import { RoomMapService } from './room_map.service';
import SocketWithUser from 'src/gateway/types/socket';

// ici add de l'authorisation de recup des credentials du front (le token)
@WebSocketGateway({
  cors: {
    origin: "http://localhost:8080",
    credentials: true
  },
  path: "",
})
@UseGuards(AuthenticatedGuard)
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  private playerQueue: number[] = [];
  private playerQueue2: number[] = [];
  private res;
  private p1;
  private p2;
  constructor(private readonly gameService: GameService, private readonly userService: UserService,
    private readonly roomMapService: RoomMapService) {}
  private room: Room;

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

  // ICICICI exemple hihihi
  @SubscribeMessage('joinQueue')
  async onJoinQueue(@MessageBody() player: number, @ConnectedSocket() socket: Socket,){
    // ici plutot que player : socket.user
    console.log("dans OnJoinQueue: userid = ", socket.user.id);
    console.log("l'ensemble du user = ", socket.user);
    // fin de l'exemple
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
  async onStartGame(@MessageBody() @ConnectedSocket() socket: Socket)
  {
      const firstPlayer = this.playerQueue2.shift()!;
      const secondPlayer = this.playerQueue2.shift()!;
      //const username1 = await this.userService.findUsernameById(this.p1);
      //const username2 = await this.userService.findUsernameById(this.p2);
      
      const Bp1 = await this.userService.getUserByID(this.p1);
      const Bp2 = await this.userService.getUserByID(this.p2);

      
      const user1: User = { id: this.p1, username: Bp1.username, point: { x: 0, y: 200 }, socketid: '' };
      const user2: User = { id: this.p2, username: Bp2.username, point: { x: 700, y: 200 }, socketid: '' };
      
      this.room = { player1: user1, player2: user2, ball: {
        x: 350, y: 200, speedX: -5, speedY: 0, speed: 5,
        radius: 0
      }, idRoom: this.res.id, scorePlayer1: 0, scorePlayer2: 0, end: 0, winner: null, idP1: this.p1,
      idP2: this.p2 };
      const Sroom: roomSend = {player1: Bp1.username, player2: Bp2.username,
        ballX: 350,
        ballY: 200, scoreP1: 0,
        scoreP2: 0, player1Y: 200, player2Y: 200, winner: '',
        roomID: this.res.id};
        console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqQ: ", this.res.id);
        this.roomMapService.addRoom(this.res.id.toString(), this.room);
        // socket.join("this.res.id.toString()");
      // this.userService.updateGamePlayer(Bp2.id, Bp2.gameplayed);
      this.server.emit('startGame2', Sroom);
  }

  @SubscribeMessage('movePoint')
  async onMovePlayer(@MessageBody() data: {userId: string, keycode: string, roomId: string}, @ConnectedSocket() socket: Socket,)
  {
    const recupRoom = this.roomMapService.getRoom(data[2]);
    console.log("in moveplayer back:    ", recupRoom);
    if (recupRoom && recupRoom.player1)
    {
    if (data[1] === 'ArrowUp')
    {
      if (recupRoom.player1.username === data[0])
      {
        if (recupRoom.player1.point.y - 10 > -10)
          recupRoom.player1.point.y -= 10;
      }
      else if (recupRoom.player2.username === data[0])
      {
        if (recupRoom.player2.point.y - 10 > -10)
          recupRoom.player2.point.y -= 10;
      }
    }
    else if (data[1] === 'ArrowDown')
    {
      if (recupRoom.player1.username === data[0])
      {
        if (recupRoom.player1.point.y + 10 < 330)
         recupRoom.player1.point.y += 10;
      }
      else if (recupRoom.player2.username === data[0])
      {
        if (recupRoom.player2.point.y + 10 < 330)
          recupRoom.player2.point.y += 10;
      }
    }
    const roomUpdate: roomSend = {player1: recupRoom.player1.username, player2: recupRoom.player2.username,
      ballX: recupRoom.ball.x, ballY: recupRoom.ball.y, scoreP1: recupRoom.scorePlayer1,
      scoreP2: recupRoom.scorePlayer2, player1Y: recupRoom.player1.point.y, player2Y: recupRoom.player2.point.y, winner: '', roomID: this.res.id};
    // this.server.emit('recupMoov', roomUpdate);
    console.log("wwwwwwwwww", recupRoom.idRoom);
      // this.server.to(data[2]).emit('recupMoove', roomUpdate);
  }
  }

  @SubscribeMessage('ballMoovEMIT')
  async onMoveBall(@MessageBody() id: string, @ConnectedSocket() socket: Socket,)
    {
      const recupRoom = this.roomMapService.getRoom(id);
      //  console.log("vvvvvvv    ", id);

    if (recupRoom && recupRoom.ball)
    {
      let roomUpdate: roomSend = {};
      recupRoom.ball.x += recupRoom.ball.speedX;
      recupRoom.ball.y += recupRoom.ball.speedY;


    const canvasWidth = 700;
    const canvasHeight = 400;
    const leftPaddle = recupRoom.player1;
    const rightPaddle = recupRoom.player2;
  
    // Condition de rebond sur la raquette du joueur 1 (gauche)
    if (
      recupRoom.ball.x <= leftPaddle.point.x + 10 &&
      recupRoom.ball.y >= leftPaddle.point.y &&
      recupRoom.ball.y <= leftPaddle.point.y + 80
    ) {
      const relativeY = (recupRoom.ball.y - leftPaddle.point.y) / 80; // Calcul de la position relative sur la raquette
      recupRoom.ball.speedX = -recupRoom.ball.speedX;
      recupRoom.ball.speedY = relativeY * 5 - 1; // Angle en fonction de la position relative
    }
  
    // Condition de rebond sur la raquette du joueur 2 (droite)
    if (
      recupRoom.ball.x >= rightPaddle.point.x - 10 &&
      recupRoom.ball.y >= rightPaddle.point.y &&
      recupRoom.ball.y <= rightPaddle.point.y + 80
    ) {
      const relativeY = (recupRoom.ball.y - rightPaddle.point.y) / 80; // Calcul de la position relative sur la raquette
      recupRoom.ball.speedX = -recupRoom.ball.speedX;
      recupRoom.ball.speedY = relativeY * 5 - 1; // Angle en fonction de la position relative
    }
  
    // Condition de rebond sur le mur haut
    if (recupRoom.ball.y <= recupRoom.ball.radius) {
      recupRoom.ball.speedY = -recupRoom.ball.speedY;
    }
  
    // Condition de rebond sur le mur bas
    if (recupRoom.ball.y >= canvasHeight - recupRoom.ball.radius) {
      recupRoom.ball.speedY = -recupRoom.ball.speedY;
    }
  
    // Condition de rebond sur les murs gauche et droit
    if (recupRoom.ball.x <= 0)
    {
      recupRoom.ball.x = canvasWidth / 2;
      recupRoom.ball.y = canvasHeight / 2;
      recupRoom.ball.speedX = -recupRoom.ball.speedX;
      recupRoom.scorePlayer2 += 1;
    }
    if (recupRoom.ball.x >= canvasWidth) {
      recupRoom.ball.x = canvasWidth / 2;
      recupRoom.ball.y = canvasHeight / 2;
      recupRoom.ball.speedX = -recupRoom.ball.speedX;
      recupRoom.scorePlayer1 += 1;
    }
    if (recupRoom.scorePlayer1 == 3 || recupRoom.scorePlayer2 == 3)
    {
      if (recupRoom.scorePlayer1 == 3)
      {
        recupRoom.winner = recupRoom.player1.username;
        recupRoom.winnerid = recupRoom.idP1;

      }
      else
      {
        recupRoom.winner = recupRoom.player2.username;
        recupRoom.winnerid = recupRoom.idP2;

      }
      this.gameService.updateGame(recupRoom);
      recupRoom.end = 1;
      roomUpdate.winner = recupRoom.winner;
      roomUpdate.end = recupRoom.end;
    }
    roomUpdate = {player1: recupRoom.player1.username, player2: recupRoom.player2.username,
      ballX: recupRoom.ball.x, ballY: recupRoom.ball.y, scoreP1: recupRoom.scorePlayer1,
      scoreP2: recupRoom.scorePlayer2, player1Y: recupRoom.player1.point.y, player2Y: recupRoom.player2.point.y,
      winner: '', roomID: this.res.id, end: recupRoom.end}
     this.server.emit('ballMoovON', roomUpdate);
      // this.server.to(id).emit('ballMoovON', roomUpdate);
  }
  }

  @SubscribeMessage('updateUserIG')
  async onUpdateUserIG(@MessageBody() id: number, @ConnectedSocket() socket: Socket,){
    
    console.log("icicicicicicicicici");
    this.userService.updateUserStatuIG(id, 'INGAME');
    this.userService.updateGamePlayer(id.toString());
  
  }

  @SubscribeMessage('leaveGame')
  async onDisconnect(@ConnectedSocket() socket: Socket) {

    if (this.room && !this.room.end)
    {
    if (socket.user.id == this.room.idP1)
    {
      this.room.winnerid = this.room.idP2;
      this.room.winner = this.room.player2.username;
      this.room.scorePlayer1 = -1;
    }
    else if (socket.user.id == this.room.idP2)
    {
      this.room.winnerid = this.room.idP2;
      this.room.winner = this.room.player1.username;
      this.room.scorePlayer2 = -1;
    }

    if (!this.room.end) 
      this.gameService.updateGame(this.room);
    this.room.end = 1;

    let roomUpdate: roomSend = {player1: this.room.player1.username, player2: this.room.player2.username,
      ballX: this.room.ball.x, ballY: this.room.ball.y, scoreP1: this.room.scorePlayer1,
      scoreP2: this.room.scorePlayer2, player1Y: this.room.player1.point.y, player2Y: this.room.player2.point.y,
      winner: '', roomID: this.res.id, end: this.room.end};
    this.room = null;
    this.server.emit('playerLeave', roomUpdate);
    }
  }

  @SubscribeMessage('changeStatus')
  async onChaneStatus(@ConnectedSocket() socket: Socket) {
  this.userService.updateUserStatuIG(socket.user.id, 'ONLINE');
  }
}