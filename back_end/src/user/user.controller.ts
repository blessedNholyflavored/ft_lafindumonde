import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '.prisma/client';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}


  @Get('/')
  findAll() {
    // console.log("lolfjeiokfjeoifjeofjoe");
    const users = this.userService.findUser();
    return users;
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Get('/:username')
  async getUserByUsername(@Param('username') username: string): Promise<User | null> {
    const user = await this.userService.findUserByUsername(username);
    return user;
  }
}
