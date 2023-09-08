import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/friend.dto';
import { Friend } from './friends.interface';

@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get('/:id')
  findAll(@Param('id') id: string) {
    return this.friendsService.findAll(id);
  }

  @Post()
  async createFriendRequest(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
  ): Promise<Friend> {
    return this.friendsService.sendFriendRequest(createFriendRequestDto);
  }
}
