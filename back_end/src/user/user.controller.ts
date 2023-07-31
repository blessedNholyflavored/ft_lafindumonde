import { Controller, Get , Post , Body , Param } from '@nestjs/common';
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

  @Post('/:id/')
  updating(@Param('id') id: string, @Body() username: string) {
	console.log(username);
	console.log(id);
	const newUsername = username['username'];
	const user = this.userService.updateUsername(id, newUsername);
	return user;
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
