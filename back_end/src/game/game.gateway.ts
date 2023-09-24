import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayInit,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server} from 'socket.io';
// ici on import le type Socket qui extends socket de socket.io mais avec l'user
import Socket from 'src/gateway/types/socket';
import { GameService } from 'src/game/game.service';
import { Room, User, roomSend } from 'src/interfaces';
import { UserService } from 'src/user/user.service';
import { RoomMapService } from './room_map.service';
import SocketWithUser from 'src/gateway/types/socket';
import { Interval } from '@nestjs/schedule';
import { disconnect } from 'process';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';

// ici add de l'authorisation de recup des credentials du front (le token)
@WebSocketGateway({
  cors: {
    origin: "http://localhost:8080",
    credentials: true
  },
  path: "",
})
export class GameGateway implements OnGatewayDisconnect, OnGatewayInit {

  @WebSocketServer()
  server: Server;
  private playerQueue: number[] = [];
  private playerQueue2: number[] = [];
  private socketQueue: Socket[] = [];
  private playerQueueBonus: number[] = [];
  private playerQueue2Bonus: number[] = [];
  private socketQueueBonus: Socket[] = [];
  private res;
  private p1;
  private p2;
  private playerQueueFriend: number[] = [];
  private playerQueue2Friend: number[] = [];
  private socketQueueFriend: Socket[] = [];
  private playerQueueBonusFriend: number[] = [];
  private playerQueue2BonusFriend: number[] = [];
  private socketQueueBonusFriend: Socket[] = [];
  // private res;
  private p1Friend;
  private p2Friend;
  constructor(private readonly gameService: GameService, private readonly userService: UserService,
  private readonly roomMapService: RoomMapService,
  private readonly authService: AuthService, private readonly chatService: ChatService,) {}
  private room: Room;
  private roomIntervals: Record<string, NodeJS.Timeout> = {};
  private playerConnections: Map<number, Socket> = new Map<number, Socket>();


  afterInit(server: Server) {
    void server;
    console.log("Gateway initialized.");
  }

/*
  j'enleve le decorateur @ConnectedSocket parce que c'est justement le probleme :
  les decorateurs guards etc ne fonctionnent pas sur handleConnection
*/
  async handleConnection(socket: Socket) {
    /*
      ici j'appelle une fonction ds authservice qui en gros va faire ce que faisait le guard
      et si aucun user n'est trouve je return undefined et donc je disconnect illico
    */
      const user = await this.authService.getUserBySocket(socket);
      if (!user)
        socket.disconnect(true);
    //  socket.emit("coucou");
      console.log("connected");
      if (socket && socket.user)
      {
        this.playerConnections.set(socket.user.id, socket);
        this.userService.updateUserStatuIG(socket.user.id, 'ONLINE');
      }

  }
  
  
	handleDisconnect(@ConnectedSocket() socket: Socket) {

    this.playerQueue.splice(0, 1);
    this.playerQueue2.splice(0, 1);
    this.socketQueue.splice(0, 1);
    // console.log(socket.user);
    console.log("diconnected");
    if (socket && socket.user)
    {
      this.playerConnections.delete(socket.user.id);
      this.userService.updateUserStatuIG(socket.user.id, 'OFFLINE');
    }


  }



  @SubscribeMessage('coucou')
  async coucou(@ConnectedSocket() socket: Socket)
  {}

  @SubscribeMessage('notifyFriendShip')
  async notifyFriendShip(@MessageBody() userId: number, @ConnectedSocket() socket: Socket)
  {
    let user1;
    const NuserId = Number(userId);
    this.playerConnections.forEach((value, key) => {
      if (key === NuserId)
        user1 = value;
    });
    console.log(user1.user);
    user1.emit("friendShipNotif");
  }

// gestion des differentes listes d'attentes (partie classique ou partie bonus)
  @SubscribeMessage('joinQueue')
  async onJoinQueue(@MessageBody() data: {player: number, type: number}, @ConnectedSocket() socket: Socket,){
    const player = data[0];
    const type = data[1]
    console.log(type);
    if (type == 1)
    {
      if (!this.playerQueueBonus.includes(player)) {
        this.playerQueueBonus.push(player);
        this.playerQueue2Bonus.push(player);
        this.socketQueueBonus.push(socket);
        console.log(`${player} a rejoint la file d'attente.`);

        const count = this.playerQueueBonus.length;
        if (this.playerQueueBonus.length === 2) {
          const firstPlayer = this.playerQueueBonus.shift()!;
          const secondPlayer = this.playerQueueBonus.shift()!;
          const socket1 = this.socketQueueBonus.shift()!;
          const socket2 = this.socketQueueBonus.shift()!;

          console.log(`Début du jeu entre ${firstPlayer} et ${secondPlayer}.`);
          this.res = await this.gameService.CreateGame(firstPlayer, secondPlayer, type);

          this.p1 = firstPlayer;
          this.p2 = secondPlayer;
          socket1.emit('queueUpdateBonus', count);
          socket2.emit('queueUpdateBonus', count);
          return ;
        }
        
        socket.emit('queueUpdateBonus', count);
      }
    }
    else
    {
      if (!this.playerQueue.includes(player)) {
        this.playerQueue.push(player);
        this.playerQueue2.push(player);
        this.socketQueue.push(socket);
        console.log(`${player} a rejoint la file d'attente.`);

        const count = this.playerQueue.length;
        if (this.playerQueue.length === 2) {
          const firstPlayer = this.playerQueue.shift()!;
          const secondPlayer = this.playerQueue.shift()!;
          const socket1 = this.socketQueue.shift()!;
          const socket2 = this.socketQueue.shift()!;

          console.log(`Début du jeu entre ${firstPlayer} et ${secondPlayer}.`);
          this.res = await this.gameService.CreateGame(firstPlayer, secondPlayer, type);

          this.p1 = firstPlayer;
          this.p2 = secondPlayer;
          socket1.emit('queueUpdate', count);
          socket2.emit('queueUpdate', count);
          return ;
        }
        
        socket.emit('queueUpdate', count);
      }
    }
  }

  // init des valeurs pour le jeu + creation de la Room de jeu dasn la db
  @SubscribeMessage('startGame')
  async onStartGame(@ConnectedSocket() socket: Socket)
  {
      const firstPlayer = this.playerQueue2.shift()!;
      const secondPlayer = this.playerQueue2.shift()!;
      
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
        this.roomMapService.addRoom(this.res.id.toString(), this.room);
        socket.join(this.res.id.toString());
        if (socket.user.id === this.room.idP1)
          this.startLoop(Sroom.roomID);

      this.server.to(this.res.id.toString()).emit('startGame2', Sroom);
  }


  // gestion des deplacements des joueurs
  @SubscribeMessage('movePoint')
  async onMovePlayer(@MessageBody() data: {userId: string, keycode: string, roomId: string}, @ConnectedSocket() socket: Socket,)
  {
    const recupRoom = this.roomMapService.getRoom(data[2]);
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
      const roomUpdate: roomSend = {
        ballX: recupRoom.ball.x, ballY: recupRoom.ball.y, player1Y: recupRoom.player1.point.y, player2Y: recupRoom.player2.point.y};
        this.server.to(recupRoom.idRoom.toString()).emit('recupMoov', roomUpdate);
    }
  }


  // boucle de jeu
  startLoop(id: number) {

    console.log("lalallalala");
    let recupRoom = this.roomMapService.getRoom(id.toString());

    this.roomIntervals[recupRoom.idRoom] = setInterval(() => {
    
      let recupRoom = this.roomMapService.getRoom(id.toString());
      let flag = 0;

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
      
        // Condition pour si un joueur marque
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

        // Condition d'arret du jeu, si un joueur a atteint le nombre de points requis
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

          roomUpdate.end = recupRoom.end;
          flag = 2;
        }
        roomUpdate = {player1: recupRoom.player1.username, player2: recupRoom.player2.username,
          ballX: recupRoom.ball.x, ballY: recupRoom.ball.y, scoreP1: recupRoom.scorePlayer1,
          scoreP2: recupRoom.scorePlayer2, 
          winner: recupRoom.winner,
          roomID: recupRoom.idRoom, end: recupRoom.end, speedX: recupRoom.ball.speedX,
          speedY: recupRoom.ball.speedY}


          this.server.to(recupRoom.idRoom.toString()).emit('ballMoovON', roomUpdate);
          if (flag === 2)
          {
            this.server.to(recupRoom.idRoom.toString()).emit('ballMoovON', roomUpdate);
            this.stopLoop(recupRoom.idRoom);
            return ;
          }
      }
      }, 1000 / 60); // 60 FPS
  }

  // Arret de la boucle de jeu pour une Room donnee
  stopLoop(roomId : number) {
    if (this.roomIntervals[roomId]) {
      clearInterval(this.roomIntervals[roomId]);
      delete this.roomIntervals[roomId];
  }
  }

  
  // Arret de la partie si un joueur quitte la game en cours
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
      winner: '', roomID: this.res.id, end: 1};
    this.room = null;
    this.stopLoop(roomUpdate.roomID);
    this.server.to(roomUpdate.roomID.toString()).emit('playerLeave', roomUpdate);

    }
  }

  // Update du User dans la db, status INGAME / ONLINE + level / xp / ELO
  @SubscribeMessage('updateUserIG')
  async onUpdateUserIG(@MessageBody() id: number, @ConnectedSocket() socket: Socket,){
    
    this.userService.updateUserStatuIG(id, 'INGAME');
    this.userService.updateGamePlayer(id.toString());
  
  }

  @SubscribeMessage('changeStatus')
  async onChaneStatus(@ConnectedSocket() socket: Socket) {
  this.userService.updateUserStatuIG(socket.user.id, 'ONLINE');
  }

  @SubscribeMessage('updateLevelExpELO')
  async onupdateLevelExpELO(@MessageBody() data: {loserID: number, roomID: number}, @ConnectedSocket() socket: Socket) {

    const recupRoom = this.roomMapService.getRoom(data[1]);
    this.userService.updateLevelExpELO(data[0], recupRoom.winnerid);

  }

  // Update score du USer dans la db pour le mini-jeu
  @SubscribeMessage('updateScoreMiniGame')
  async onUpdateScoreMiniGame(@MessageBody() newScore: number, @ConnectedSocket() socket: Socket) {
  this.userService.updateScoreMiniGame(socket.user.id, newScore);

  }

  @SubscribeMessage('inviteToMatch')
  async onInviteToMatch(@MessageBody() recipient: number, @ConnectedSocket() socket: Socket) {

    let user1;
    const NuserId = Number(recipient);
    this.playerConnections.forEach((value, key) => {
      if (key === NuserId)
        user1 = value;
    });
    if (user1)
      user1.emit("receiveInvite", socket.user.id);
  }

  @SubscribeMessage('matchAccepted')
  async onMatchAccepted(@MessageBody() recipient: number, @ConnectedSocket() socket: Socket) {

    let user1;
    const NuserId = Number(recipient);
    this.playerConnections.forEach((value, key) => {
      if (key === NuserId)
        user1 = value;
    });
    this.res = await this.gameService.CreateGame(socket.user.id, NuserId, 0);

    this.p1Friend = socket.user.id;
    this.p2Friend = NuserId;
    this.playerQueue2Friend.push(socket.user.id);
    this.playerQueue2Friend.push(NuserId);

    user1.emit("matchStart");
    socket.emit("matchStart");

  }

    // init des valeurs pour le jeu + creation de la Room de jeu dasn la db
    @SubscribeMessage('startGameFriend')
    async onStartGameFriend(@ConnectedSocket() socket: Socket)
    {
        const firstPlayer = this.playerQueue2Friend.shift()!;
        const secondPlayer = this.playerQueue2Friend.shift()!;
        
        const Bp1 = await this.userService.getUserByID(this.p1Friend);
        const Bp2 = await this.userService.getUserByID(this.p2Friend);
        
        const user1: User = { id: this.p1Friend, username: Bp1.username, point: { x: 0, y: 200 }, socketid: '' };
        const user2: User = { id: this.p2Friend, username: Bp2.username, point: { x: 700, y: 200 }, socketid: '' };
        
        this.room = { player1: user1, player2: user2, ball: {
          x: 350, y: 200, speedX: -5, speedY: 0, speed: 5,
          radius: 0
        }, idRoom: this.res.id, scorePlayer1: 0, scorePlayer2: 0, end: 0, winner: null, idP1: this.p1Friend,
        idP2: this.p2Friend };
        const Sroom: roomSend = {player1: Bp1.username, player2: Bp2.username,
          ballX: 350,
          ballY: 200, scoreP1: 0,
          scoreP2: 0, player1Y: 200, player2Y: 200, winner: '',
          roomID: this.res.id};
          this.roomMapService.addRoom(this.res.id.toString(), this.room);
          socket.join(this.res.id.toString());
          if (socket.user.id === this.room.idP1)
            this.startLoop(Sroom.roomID);
  
        this.server.to(this.res.id.toString()).emit('startGame2', Sroom);
    }


    @SubscribeMessage('reloadMessages')
    async onNewMessage(@MessageBody() data: {message:string, recipient:string},@ConnectedSocket() socket: Socket)
    {
      let user1;
      const NuserId = Number(data[1]);
      this.playerConnections.forEach((value, key) => {
        if (key === NuserId)
          user1 = value;
      });
      user1.emit("refreshMessages");
      socket.emit("refreshMessages");
    }

    @SubscribeMessage('reloadMessRoom')
    async onNewMessageRoom(@MessageBody() id: string,@ConnectedSocket() socket: Socket)
    {
      let user1;
      const Ids = this.chatService.getUsersInRoom(id);
      (await Ids).forEach((userId) => {
        this.playerConnections.forEach((value, key) => {
          if (key === userId)
            user1 = value;
          if (user1) {
            user1.emit("refreshMessagesRoom");
          }
        });
      });
    }

    @SubscribeMessage('reloadListRoom')
    async onNewListRoom(@MessageBody() id: string,@ConnectedSocket() socket: Socket)
    {
      let user1;
      const Ids = this.chatService.getUsersInRoom(id);
      (await Ids).forEach((userId) => {
        this.playerConnections.forEach((value, key) => {
          if (key === userId)
            user1 = value;
          if (user1) {
            user1.emit("refreshListRoom");
          }
        });
      });
    }
    @SubscribeMessage('reloadListRoomAtJoin')
    async onNewListRoomAtJoin(@MessageBody() name: string,@ConnectedSocket() socket: Socket)
      {
        const allRooms = this.chatService.getAllChatRooms();
        const goodRoom = (await allRooms).find((room) => room.name === name);
        let user1;
        const Ids = this.chatService.getUsersInRoom(goodRoom.id.toString());
        (await Ids).forEach((userId) => {
          this.playerConnections.forEach((value, key) => {
            if (key === userId)
              user1 = value;
            if (user1) {
              user1.emit("refreshListRoom");
            }
          });
        });
      }

      @SubscribeMessage('NotifyInviteChannel')
      async onNotifyInviteChannel(@MessageBody() id: number,@ConnectedSocket() socket: Socket)
      {
        let user1;
        const NuserId = Number(id);
        this.playerConnections.forEach((value, key) => {
          if (key === NuserId)
            user1 = value;
        });
        user1.emit("NotifyReceiveChannelInvit");
      }

      
}
