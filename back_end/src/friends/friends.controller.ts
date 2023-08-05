import { Body, Controller, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { UserService } from 'src/user/user.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private friendsService: FriendsService,
    private userService: UserService,
  ) {}

  @Post('friends')
  async showFriends(@Body() userId: any) {
    const { id } = userId;
    const friends = await this.friendsService.showFriends(id);
    return friends;
  }
}
