import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Player } from '../game/player.interface';
  
  @WebSocketGateway()
  export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    players: Player[] = [];
    waitingPlayers: Player[] = [];
  
    handleConnection(socket: Socket) {
      console.log(`Client connecté : ${socket.id}`);
    }
  
    handleDisconnect(socket: Socket) {
      console.log(`Client déconnecté : ${socket.id}`);
  
      const disconnectedPlayer = this.players.find(player => player.id === socket.id);
      if (disconnectedPlayer) {
        this.players = this.players.filter(player => player.id !== socket.id);
  
        if (disconnectedPlayer.username !== 'ldinaut') {
          this.waitingPlayers = this.waitingPlayers.filter(player => player.id !== socket.id);
        }
      }
  
      this.updateQueue();
    }
  
    @SubscribeMessage('joinQueue')
    handleJoinQueue(socket: Socket, username: string) {
      const player: Player = { id: socket.id, username };
      this.players.push(player);
  
      if (username === 'ldinaut') {
        socket.emit('queueUpdate', this.waitingPlayers.length);
      } else {
        this.waitingPlayers.push(player);
        this.updateQueue();
  
        if (this.waitingPlayers.length >= 2) {
          const player1 = this.waitingPlayers.shift();
          const player2 = this.waitingPlayers.shift();
  
          if (player1 && player2) {
            const room = this.generateRoomId();
            this.server.to(player1.id).emit('joinGame', { roomId: room });
            this.server.to(player2.id).emit('joinGame', { roomId: room });
          }
        }
      }
    }
  
    updateQueue() {
      this.server.emit('queueUpdate', this.waitingPlayers.length);
    }
  
    generateRoomId(): string {
      // Logic to generate a unique room ID
      return 'room_' + Math.random().toString(36).substr(2, 9);
    }
  }
  