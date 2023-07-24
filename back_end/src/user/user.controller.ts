import { Controller, Get , Post , Body } from '@nestjs/common';
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

  @Post('update-username')
  updating(@Body() username: string) {
	const user = this.userService.updateUsername(username);
	return ;
  }
}
