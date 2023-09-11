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

  @Post('/:id/:id1')
  async createFriendRequest(@Param('id') id: string,@Param('id1') id1: string) {
    console.log("cacacacacaacacacacca:     ",id);
    console.log("111111111111:     ",id1);
    const senderId = id;
    const recipientId = id1;
    const amitie = await this.friendsService.sendFriendRequest(senderId, recipientId);
    return amitie;
  }
}
