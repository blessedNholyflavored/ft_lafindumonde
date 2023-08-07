import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/')
  findAll() {
    const users = this.userService.findUser();
    return users;
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const ret = await this.userService.getID(parseInt(id));
    return ret;
  }

  // @Get('/:id')
  // async getAchievements(@Param('id') userId: string) {
  //   const achievements = await this.userService.getUserAchievements(
  //     parseInt(userId),
  //   );
  //   return achievements;
  // }
}
