import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

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
    //console.log(username);
    //console.log(id);
    const newUsername = username['username'];
    const user = this.userService.updateUsername(id, newUsername);
    return user;
  }

  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
    let pictureURL = this.userService.getPicture(id);
    console.log(pictureURL);
    return pictureURL;
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
