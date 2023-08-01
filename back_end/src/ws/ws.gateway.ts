// ws.gateway.ts

import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class WsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('playerMove')
  handlePlayerMove(client: any, move: string): void {
    // Gérer les mouvements des joueurs (bas ou haut)
    // Vous pouvez transmettre les mouvements à l'autre joueur via les WebSockets
    this.server.emit('opponentMove', move);
  }
}
