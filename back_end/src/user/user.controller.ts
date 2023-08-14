import { Controller, Get , Post , Body, Res , Param, UploadedFile, UseInterceptors, ParseFilePipe, HttpException, HttpStatus  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import * as mimeTypes from 'mime-types';


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
    //console.log(id);
    const newUsername = username['username'];
    const user = this.userService.updateUsername(id, newUsername);
    return user;
  }

  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
    let pictureURL = this.userService.getPicture(id);
	//const backPath = path.join(, pictureURL);
    console.log(pictureURL);
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
				// if (file && mimeTypes.lookup(file.originalname) === 'image/jpeg' || mimeTypes.lookup(file.originalname) === 'image/png')
				// {
				// 	console.log("111111111111111111111111111111111111111111111");
				// 	if (file.size < 52000)
				// 		cb(null, `${name}-${rand}${fileExtName}`);
				// }
				// else
				// {
				// 	console.log("2222222222222222222222222222222222222222222");

				// 	throw new HttpException('jpg/jpeg/png images files only accepted', HttpStatus.BAD_REQUEST);
				// }
				cb(null, `${name}-${rand}${fileExtName}`);

			}
		}),
	}),
	)
  async updatePic(@Param('id') id: string, @UploadedFile() file: any)//: Express.Multer.File)
  {
	
		console.log("SSSSSSSSSSSSSSSSSSSSSSSSSS", file.size);
		//if (file.size > 52000)
		//	throw new  HttpException('file too big :(', HttpStatus.BAD_REQUEST);
		//const name = file.originalname.split('.')[0];
		//const picPath = file.path;
		const test = file.filename
		await this.userService.updatePicture(id, file.filename);
		return { test };
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const ret = await this.userService.getID(parseInt(id));
    return ret;
  }

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
