import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import { User } from '.prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  friendService: any;
  constructor(private userService: UserService) {}

  @Get('/')
  findAll() {
    const users = this.userService.findUser();
    return users;
  }

  @Post('/:id/')
  updating(@Param('id') id: string, @Body() username: string) {
    console.log(username);
    console.log(id);
    const newUsername = username['username'];
    const user = this.userService.updateUsername(id, newUsername);
    return user;
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    const ret = await this.userService.getID(id);
    return ret;
  }

  // @Get('/:username')
  // async getUserByUsername(@Param('username') username: string): Promise<User | null> {
  //   const user = await this.userService.findUserByUsername(username);
  //   return user;

  @Post('/:id/update-username')
  updating_username(@Param('id') id: string, @Body() username: string) {
    //console.log(username);
    //console.log(id);
    const newUsername = username['username'];
    const user = this.userService.updateUsername(id, newUsername);
    return user;
  }
  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
    const pictureURL = this.userService.getPicture(id);
    //const backPath = path.join(, pictureURL);
    console.log(pictureURL);
    //console.log(backPath);
    return pictureURL;
  }

  @Get('/uploads/:file')
  getFileUrl(@Param('file') file: string, @Res() res: Response) {
    return res.sendFile(file, { root: 'uploads/' });
  }

  @Post('/:id/update-avatar')
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
    }),
  )
  async updatePic(
    @Param('id') id: string,
    @UploadedFile() file: any, //: Express.Multer.File)
  ) {
    const name = file.originalname.split('.')[0];

    console.log(file);
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    console.log(file.filename);
    const picPath = file.path;
    const test = file.filename;
    const updateUser = await this.userService.updatePicture(id, file.filename);
    return { test };
    //return (updateUser);
  }

  @Get('/status/:id')
  async getPlayerStatus(@Param('id') id: number) {
    console.log('qqqqqqqqqqqqqqqqqqqqq');
    const user = await this.userService.getUserByID(id);
    console.log(
      'dans le back mdr:    ',
      user.status,
      '    fin dans le back ndrrrrr',
    );
    return user.status;
  }

  // @Get('/:id')
  // async getUserById(@Param('id') id: string) {
  //   const ret = await this.userService.getID(parseInt(id));
  //   return ret;
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
