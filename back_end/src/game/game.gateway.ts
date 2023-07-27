// pong.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private player1Socket: Socket | null = null;
  private player2Socket: Socket | null = null;

  afterInit() {
    console.log('Serveur WebSocket initialisé.');
  }

  handleConnection(client: Socket) {
    console.log(`Un joueur s'est connecté : ${client.id}`);
    if (!this.player1Socket) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
      this.player1Socket = client;
    } else if (!this.player2Socket) {
      this.player2Socket = client;
    }

    // Envoyez un message au client pour indiquer son numéro de joueur (1 ou 2)
    if (this.player1Socket && this.player1Socket.id === client.id) {
      client.emit('player-info', { playerId: 1 });
    } else if (this.player2Socket && this.player2Socket.id === client.id) {
      client.emit('player-info', { playerId: 2 });
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Un joueur s'est déconnecté : ${client.id}`);
    if (this.player1Socket && this.player1Socket.id === client.id) {
      this.player1Socket = null;
    } else if (this.player2Socket && this.player2Socket.id === client.id) {
      this.player2Socket = null;
    }
  }
                                                                                                                                                
  sendMoveToOpponent(playerId: number, move: string) {
    const opponentSocket = playerId === 1 ? this.player2Socket : this.player1Socket;
    if (opponentSocket) {
      opponentSocket.emit('opponent-move', move);
    }
  }
}

