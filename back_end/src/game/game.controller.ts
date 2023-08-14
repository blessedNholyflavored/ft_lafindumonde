import { Controller, Get , Post , Body, Res , Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from '.prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import { GameService } from './game.service';


@Controller('game')
export class GameController {
  friendService: any;
  userService: any;
  constructor(private gameService: GameService) {}

  @Post('/create')
  createGame()
  {
    console.log("DANS CREATE GAME");
  }
}