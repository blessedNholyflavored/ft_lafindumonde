import { Controller, Get , Post , Body, Res , Req, Param, UploadedFile, UseInterceptors, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from '.prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guards';
import { get } from 'http';


@Controller('chat')
@UseGuards(...AuthenticatedGuard)
export class ChatController {
  friendService: any;
  constructor(private chatService: ChatService,private readonly userService: UserService) {}

  @Get('/recupMess/:id/:id1')
  async recupMess(@Param('id') id: number,@Param('id1') id1: number)
  {
		console.log("///////////////STILL PENDING//////////////");
		console.log("IN RECUP MESS/////");
		console.log("id is:", id);
		console.log("id1 is :", id1);
    return this.chatService.recupMessById(id.toString(), id1.toString());
  }

  @Get('/recupRoomMess/:id/')
  async recupRoomMess(@Param('id') id: number, @Req() req:any)
  {
		// check if user emitting request is in the room
		const usersInRoom = await this.chatService.getUsersInRoom(id.toString());
		if (usersInRoom.includes(req.user.id) === false)
		{
			throw new UnauthorizedException("User isn't in room");
		}
    return this.chatService.recupRoomMess(id.toString());
  }

  @Get('/getRole/:id/:id1')
  async getRole(@Req() req: any, @Param('id') senderId: string,@Param('id1') roomId: number)
  {
		//converts senderId to number because implicit type isn't number
		const nbrSenderId =  parseInt(senderId);
		const usersInRoom = await this.chatService.getUsersInRoom(roomId.toString());
		if (usersInRoom.includes(req.user.id) === false){
			//if the user issuing the request isn't in the room, he can't assigned someone to a role in the room
			throw new UnauthorizedException("User isn't in room");
		}
		else if(usersInRoom.includes(nbrSenderId) == false){
			//if the user assigned to role isn't in room, error
			throw new BadRequestException("Sent user isn't in room");
		}
    return this.chatService.getRole(senderId.toString(), roomId.toString());
  }

  @Get('/getUserInRoom/:id/')
  async getUserInRoom(@Param('id') roomId: number)
  {
    return this.chatService.getUsersInRoomForList(roomId.toString());
  }
  
  @Get('/checkRoomName/:name')
  async checkRoomName(@Param('name') name: string)
  {
    return this.chatService.checkRoomExist(name);
  }

  @Get('/recupYourRooms')
  async recupYourRooms(@Req() req: any)
  {
    return this.chatService.recupYourRooms(req.user.id.toString());
  }

  @Get('/invSend/:id/:id1')
  async invSend(@Param('id') id: string, @Param('id1') id1: string)
  {
    return this.chatService.recupInvSend(id, id1);
  }

  @Get('/recupRooms/')
  async recupRooms(@Req() req: any)
  {
    return this.chatService.recupRooms(req.user.id.toString());
  }

  @Get('/recupPrivate/')
  async recupPrivate(@Req() req: any)
  {
    return this.chatService.recupPrivate(req.user.id.toString());
  }

  @Get('/invReceive/:id')
  async recupInvReceive(@Param('id') id: string)
  {
    return this.chatService.recupInvReceive(id);
  }

  @Get('/roomName/:id')
  async getRoomName(@Param('id') id: string)
  {
    return this.chatService.getRoomName(id);
  }

  @Get('/usersNotInRoom/:id/:id1')
  async recupUserNotInChan(@Param('id') id: number, @Param('id1') userId: string)
  {
    return this.chatService.recupUserNotInChan(id.toString(), userId);
  }

  @Post('/invite/:id/:id1/:id2')
  async invite(@Param('id') senderId: string,@Param('id1') recipientId: string,@Param('id2') roomId: string)
  {
    return this.chatService.createInvite(senderId.toString(),recipientId.toString(), roomId.toString());
  }

  @Post('refuse/:id')
  refuseFriend(@Param('id') id: string) {
    return this.chatService.refuseInvite(id);
  }

  @Post('leftChan/:id/:id1')
  leftChan(@Param('id') roomId: string, @Param('id1') userId: string) {
    return this.chatService.leftChan(roomId, userId);
  }

  @Post('ban/:id/:id1/:time')
  banChan(@Param('id') roomId: string, @Param('id1') userId: string, @Param('time') time: number) {
    return this.chatService.banSomeone(roomId, userId, time);
  }

  @Post('mute/:id/:id1/:time')
  muteSomeone(@Param('id') roomId: string, @Param('id1') userId: string, @Param('time') time: number) {
    return this.chatService.muteSomeone(roomId, userId, time);
  }

  @Post('unmute/:id/:id1')
  unMuteSomeone(@Param('id') roomId: string, @Param('id1') userId: string) {
    return this.chatService.unMuteSomeone(roomId, userId);
  }

  @Post('unban/:id/:id1')
  unBanSomeone(@Param('id') roomId: string, @Param('id1') userId: string) {
    return this.chatService.unBanSomeone(roomId, userId);
  }


  @Get('/muted/:id/:id1')
  async getStatusMute(@Param('id') userId: string, @Param('id1') roomId: string)
  {
    return this.chatService.getStatusMute(userId, roomId);
  }

  @Get('/banned/:id/:id1')
  async getStatusBan(@Param('id') userId: string, @Param('id1') roomId: string)
  {
    return this.chatService.getStatusBan(userId, roomId);
  }


  @Post('/admin/:id/:id1')
  async passAdmin(@Param('id') userId: string, @Param('id1') roomId: string)
  {
    return this.chatService.passAdmin(roomId, userId);
  }

  @Post('/demoteAdmin/:id/:id1')
  async demoteAdmin(@Param('id') userId: string, @Param('id1') roomId: string)
  {
    return this.chatService.demoteAdmin(roomId, userId);
  }

  @Get('/statut/:id')
  async getStatusChan(@Param('id') roomId: string)
  {
    return this.chatService.getStatusChan(roomId);
  }

  @Post('/changeStatut/:id/:option/:pass')
  async changeStatut(@Param('id') roomId: string, @Param('option') option: string, @Param('pass') pass: string)
  {
    return this.chatService.changeStatut(roomId, option, pass);
  }  
}