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
import SocketWithUser from 'src/gateway/types/socket';
import { Interval } from '@nestjs/schedule';
import { disconnect } from 'process';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';

// ici add de l'authorisation de recup des credentials du front (le token)
@WebSocketGateway({
  cors: {
    origin: "http://" + process.env.HOSTNAME,
    credentials: true
  },
  path: "",
})
export class ChatGateway {


  @WebSocketServer()
  server: Server;
  constructor(private readonly chatService: ChatService, private readonly userService: UserService,
    private readonly authService: AuthService) {}



  @SubscribeMessage('newMessage')
  async onNewMessage(@MessageBody() data: {message:string, recipient:string},@ConnectedSocket() socket: Socket)
  {
    this.chatService.CreateMessage(data[0], socket.user.id.toString(), data[1])
  }

  @SubscribeMessage('createChatRoom')
  async onCreateChatRoom(@MessageBody() data: {nameRoom:string, option:string, hash:string},@ConnectedSocket() socket: Socket)
  {
    this.chatService.CreateRoom(data[0], data[1], data[2], socket.user.id.toString())
  }

  @SubscribeMessage('joinChatRoom')
  async onJoinChatRoom(@MessageBody() data: {nameRoom:string, option:string, hash:string},@ConnectedSocket() socket: Socket)
  {
    const ret = await this.chatService.JoinRoom(data[0], data[1], data[2], socket.user.id.toString())
    if (ret === 2)
      socket.emit("NotifyBadPWD");
      
  }

  @SubscribeMessage('newMessageRoom')
  async onNewMessageRoom(@MessageBody() data: {message:string, roomId:string},@ConnectedSocket() socket: Socket)
  {
    this.chatService.CreateMessageRoom(data[0], socket.user.id.toString(), data[1])
  }

  @SubscribeMessage('reloadListRoomForOne')
  async onreloadForOne(socket: Socket)
  {
    socket.emit("refreshForOne");
  }

  
}
