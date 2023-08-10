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
  updating(@Param('id') id: number, @Body() username: string) {
	console.log(username);
	console.log(id);
	const newUsername = username['username'];
	const user = this.userService.updateUsername(id, newUsername);
	return user;
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number){
    const ret = await this.userService.getID(id);
    return ret;
  }
  
  @Get('/:username')
  async getUserByUsername(@Param('username') username: string): Promise<User | null> {
    const user = await this.userService.findUserByUsername(username);
    return user;
  }
}
