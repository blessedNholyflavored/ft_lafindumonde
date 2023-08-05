// game.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    console.log('WebSocket initialized.');
  }

  @SubscribeMessage('updatePointPosition')
  handleUpdatePointPosition(client: Socket, data: { x: number; y: number }) {
    console.log('Received updatePointPosition:', data);
    // Envoyer la position mise à jour à tous les clients, y compris l'émetteur
    this.server.emit('updatePointPosition', data);
  }
}
