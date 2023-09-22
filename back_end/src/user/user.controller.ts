import {
  Controller,
  Get,
  Post,
  Body,
  Res,
	Req,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import * as mimetype from 'mime-types';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guards';

@Controller('users')
@UseGuards(...AuthenticatedGuard)
export class UsersController {
  friendService: any;
  constructor(private userService: UserService) {}

  //cette function est commentée parce que pas sécurisée
  // si besoin de l'utiliser pour une feature definitive
  // il faudra trouver comment virer les champs totpKey et pwd
/*
  @Get('/')
  findAll() {
    const users = this.userService.findUser();
    return users;
  }
*/
  @Post('/update-username')
  updating_username(@Req() req: any, @Body() username: string) {
    //console.log(username);
    console.log('service update username ', req.user.id);
    const newUsername = username['username'];
    this.userService.updateUsername(req.user.id, newUsername);
  }
  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
    const pictureURL = this.userService.getPicture(id);
    //const backPath = path.join(, pictureURL);
    //console.log(pictureURL);
    //console.log(backPath);
    return pictureURL;
  }

  @Get('/uploads/:file')
  async getFileUrl(@Param('file') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: 'uploads/' });
  }

  @Post('/update-avatar')
  @UseInterceptors(
    FileInterceptor('userpic', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = path.extname(file.originalname);
          const rand = `${Date.now()}-${Math.round(Math.random() * 16)}`;
          cb(null, `${name}-${rand}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpeg'
        ) {
          console.log('IFFFFFFFFFFFFFFFFF');
          cb(null, true);
        } else {
          console.log('ELSSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
          cb(
            new HttpException(
              'jpg/jpeg/png images files only accepted',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 4,
      },
    }),
  )
  async updatePic(
    @Req() req: any,
    @UploadedFile() file: any, //: Express.Multer.File)
  ) {
    //const name = file.originalname.split('.')[0];
    //const picPath = file.path;
    const test = file.filename;
    await this.userService.updatePicture(req.user.id, file.filename);
    return { test };
  }

  @Get('/:id/username')
  async getUsernameById(@Param('id') id: string)
  {
	const user = this.userService.getUsernameById(id);
	return user;
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    const ret = await this.userService.getID(id.toString());
    return this.userService.exclude(ret, ['totpKey', 'password']);
  }

  @Get('/:id/games-data')
  async fetchGameData(@Param('id') id: string)
  {
	const games = await this.userService.fetchAllGames(id);
	return (games);
  }

  @Get('/status/:id')
  async getPlayerStatus(@Param('id') id: number) {
    const user = await this.userService.getUserByID(id);
    console.log(
      'dans le back mdr:    ',
      user.status,
      '    fin dans le back ndrrrrr',
    );
    return user.status;
  }

  // @Get('/scoresMG')
  // async GetAllScores()
  // {
  //   console.log("bite");
  // }

  // @Get('/friends/:id')
  // async getFriends(@Param('id') id: string) {
  //   const friends = await this.friendService.findAll(id);
  //   return friends;
  // }

  // @Get('/:id')
  // async getAchievements(@Param('id') userId: string) {
  //   const achievements = await this.userService.getUserAchievements(
  //     parseInt(userId),
  //   );
  //   return achievements;
  // }
}
