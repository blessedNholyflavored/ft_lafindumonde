import { Controller, Get , Post , Body, Res , Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from '.prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';


@Controller('chat')
export class ChatController {
  friendService: any;
  constructor(private chatService: ChatService,private readonly userService: UserService) {}

  @Get('/recupMess/:id/:id1')
  async recupMess(@Param('id') id: number,@Param('id1') id1: number)
  {
    return this.chatService.recupMessById(id.toString(), id1.toString());
  }
}