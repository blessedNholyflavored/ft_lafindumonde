// backend/src/pong/pong.service.ts
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class PongService {
  private io: Server;

  initSocket(server: any) {
    this.io = require('socket.io')(server, {
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  updatePaddlePosition(player: number, paddleY: number) {
    this.io.emit('updatePaddlePosition', { player, paddleY });
  }
}
