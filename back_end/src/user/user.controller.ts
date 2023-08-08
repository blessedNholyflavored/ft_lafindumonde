import { Controller, Get , Post , Body , Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/')
  findAll() {
    // console.log("lolfjeiokfjeoifjeofjoe");
    const users = this.userService.findUser();
    return users;
  }

  @Post('/:id/')
  updating(@Param('id') id: string, @Body() username: string) {
	//console.log(username);
	//console.log(id);
	const newUsername = username['username'];
	const user = this.userService.updateUsername(id, newUsername);
	return user;
  }

  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
	let pictureURL = this.userService.getPicture(id);
	//console.log(pictureURL);
	return (pictureURL);
  }
//https://i.pinimg.com/236x/db/64/f5/db64f57279a9306d3c980cac55d5dbdf--honey-tags.jpg
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
	}),
	)
  async updatePic(@Param('id') id: string, @UploadedFile() file: any)//: Express.Multer.File)
  {
	console.log(file);
	console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
	console.log(file.filename);
	const picPath = file.path;
	const updateUser = await this.userService.updatePicture(id, picPath);
	return (updateUser);
  }
}
