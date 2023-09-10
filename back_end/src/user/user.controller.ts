import { Controller, Get , Post , Body, Res , Param, UploadedFile, UseInterceptors, HttpException, HttpStatus  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import { User } from '.prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import * as mimetype from 'mime-types';


@Controller('users')
export class UsersController {
  friendService: any;
  constructor(private userService: UserService) {}


  @Get('/')
  findAll() {
    const users = this.userService.findUser();
    return users;
  }

  @Post('/:id/update-username')
  updating_username(@Param('id') id: string, @Body() username: string) {
    //console.log(username);
    console.log("service update username ", id);
    const newUsername = username['username'];
    const user = this.userService.updateUsername(id, newUsername);
    return user;
  }

  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
    let pictureURL = this.userService.getPicture(id);
	//const backPath = path.join(, pictureURL);
    //console.log(pictureURL);
	//console.log(backPath);
    return pictureURL;
  }

  @Get('/uploads/:file')
  async getFileUrl(@Param('file') filename: string, @Res() res: Response)
  {
	return res.sendFile(filename, {root : 'uploads/'});
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
			}
		}),
		fileFilter: (req, file, cb) => {
			if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')
			{
				console.log("IFFFFFFFFFFFFFFFFF");
				cb(null, true);
			} else {
				console.log("ELSSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
				cb(new HttpException('jpg/jpeg/png images files only accepted', HttpStatus.BAD_REQUEST), false);
			}
		},
		limits: {
			fileSize: 1024 * 1024 * 4,
		},
	}),
	)
  async updatePic(@Param('id') id: string, @UploadedFile() file: any)//: Express.Multer.File)
  {
		//const name = file.originalname.split('.')[0];
		//const picPath = file.path;
		const test = file.filename
		await this.userService.updatePicture(id, file.filename);
		return { test };
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number){
    const ret = await this.userService.getID(id);
    return ret;
  }

  @Get('/status/:id')
  async getPlayerStatus(@Param('id') id: number)
  {
    const user = await this.userService.getUserByID(id);
    console.log("dans le back mdr:    ", user.status, "    fin dans le back ndrrrrr");
    return (user.status);
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
