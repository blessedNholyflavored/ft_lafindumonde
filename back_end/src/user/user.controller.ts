import { Controller, Get, Post, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/')
  findAll() {
    // console.log("lolfjeiokfjeoifjeofjoe");
    const users = this.userService.findUser();
    return users;
  }

  @Post('/:id')
  async findUsernameById(@Param('id') id: string) {
    console.log("aaaaaaa");
  }
}
