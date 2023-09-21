import { Controller, Get , Post , Body, Res , Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
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
    return this.chatService.recupMessById(id.toString(), id1.toString());
  }

  @Get('/recupRoomMess/:id/')
  async recupRoomMess(@Param('id') id: number)
  {
    return this.chatService.recupRoomMess(id.toString());
  }

  @Get('/getRole/:id/:id1')
  async getRole(@Param('id') senderId: number,@Param('id1') roomId: number)
  {
    return this.chatService.getRole(senderId.toString(), roomId.toString());
  }
  
  @Get('/checkRoomName/:name')
  async checkRoomName(@Param('name') name: string)
  {
    return this.chatService.checkRoomExist(name);
  }

  @Get('/recupYourRooms/:id')
  async recupYourRooms(@Param('id') id: string)
  {
    return this.chatService.recupYourRooms(id);
  }

  @Get('/recupRooms/:id')
  async recupRooms(@Param('id') id: string)
  {
    return this.chatService.recupRooms(id);
  }

  @Get('/recupPrivate/:id')
  async recupPrivate(@Param('id') id: string)
  {
    return this.chatService.recupPrivate(id);
  }

  
}