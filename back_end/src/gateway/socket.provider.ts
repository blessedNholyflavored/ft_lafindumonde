// import { Injectable } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';
// import { SocketGateway } from './socket.gateway';
// import * as http from 'http'; // Importez le type http.Server
// import { Room } from 'src/interfaces';

// @Injectable()
// export class WebsocketProvider {
//     constructor(private readonly websocketsGateway: SocketGateway) {}
//     private activePlayers: Record<number, Socket[]> = {};
//      private socketList: Socket[] = [];


//   initializeWebSocket(server: http.Server) { // Utilisez le type http.Server ici
//     const io = new Server(server, {
//       cors: {
//         origin: 'http://localhost:8080', // Assurez-vous que cette URL correspond à votre front-end
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       this.websocketsGateway.handleConnection(socket);

//       socket.on('joinQueue', async (socket: Socket, player: number) => {

//         let count = await this.websocketsGateway.handleJoinQueue(socket, player);
//         if (!this.socketList.includes(socket))
//             this.socketList.push(socket);
//         if (this.socketList.length == 2)
//         {
//             const socketP1 = this.socketList.shift()!;
//             const socketP2 = this.socketList.shift()!;
//             this.activePlayers[count] = [socketP1, socketP2];
//             this.activePlayers[count].forEach(playerSocket => {
//               playerSocket.emit('queueUpdate', count);
//             });
//         }
//       })
      
//       socket.on('startGame', (roomData: Room, id: number) => {
//         this.websocketsGateway.handleStartGame(roomData, id);
//       })

//       socket.on('movePoint', (data: number, keycode: string, room: Room) => {
//         this.websocketsGateway.handleMoves(data, keycode, room);
//       })

//       socket.on('ballMoovEMIT', (room: Room) => {
//         this.websocketsGateway.handleBallMoves(room);
//       })

//     });
//   }
// }
