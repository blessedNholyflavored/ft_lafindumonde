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
  
  @Get('/checkRoomName/:name')
  async checkRoomName(@Param('name') name: string)
  {
    return this.chatService.checkRoomExist(name);
  }

  @Get('/recupYourRooms/:id')
  async recupYourRooms(@Param('id') id: string, @Req() req: any)
  {
		// console.log("////////////////PENDING");
		// console.log("RECUP YOUR ROOMS");
		// console.log("user making request: ", req.user.id);
		// console.log("user id gave in function:", id);
		const userID = parseInt(id);
		if (req.user.id != userID)
			console.log("/////ALERT ALERT ALERT ALERT IN RECUP YOUR ROOMS CONTROLLER/////");
		// TODO: if alert is never raised : erase id of this route
    return this.chatService.recupYourRooms(req.user.id.toString());
  }

  @Get('/recupRooms/:id')
  async recupRooms(@Req() req: any, @Param('id') id: string)
  {
	//	console.log("////////////////PENDING");
		// console.log("RECUP ROOMS");
		// console.log("user making request: ", req.user.id);
		// console.log("user id gave in function:", id);
		if (req.user.id != id)
			console.log("ALERT ALERT ALERT IN RECUPROOMS CHAT CONTROLLER ALERT ALERT");
		//TODO: if alert is never raised, clear Param and only use req.user.id
    return this.chatService.recupRooms(id);
  }

  @Get('/recupPrivate/:id')
  async recupPrivate(@Req() req: any, @Param('id') id: string)
  {
		// console.log("////////////////PENDING");
		// console.log("RECUP PRIV");
		// console.log("user making request: ", req.user.id);
		// console.log("user id gave in function:", id);
		if (req.user.id != id)
			console.log("ALERT ALERT ALERT IN RECUPPRIVATE CHAT CONTROLLER ALERT ALERT");
	//TODO: if alert is never raised, clear Param and only use req.user.id
    return this.chatService.recupPrivate(id);
  }

  @Get('/usersNotInRoom/:id')
  async recupUserNotInChan(@Param('id') id: number)
  {
    return this.chatService.recupUserNotInChan(id.toString());
  }

  
}