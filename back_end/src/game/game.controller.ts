import { Controller, Get , Post , Body, Res , Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from '.prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import { GameService } from './game.service';
import { UserService } from 'src/user/user.service';


@Controller('game')
export class GameController {
  friendService: any;
  constructor(private gameService: GameService,private readonly userService: UserService) {}

  @Get('/create/:id')
  async createGame(@Param('id') id: string)
  {
    console.log("AAAAAAAAAAAAAAAA");
  }
}