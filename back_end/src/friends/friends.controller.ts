import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { UserService } from 'src/user/user.service';
import { Friend } from './types/friends';
import { Response } from 'express';

@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get('/:id')
  findAll(@Param('id') id: string) {
    return this.friendsService.findAll(id);
  }
 
  // @Post('/')
  // async addFriends(@Body() usersId: any) {
  //   const { senderId, recipientId } = usersId;
  //   const newFriendship = await this.friendsService.openFriendship(
  //     parseInt(senderId),
  //     recipientId,
  //   );
  //   return newFriendship;
  // }
  
  @Post('/create')
  async addNewFriendship(@Body() usersId: any) {
    const { senderId, recipientId } = usersId;
    const newFriendship = await this.friendsService.addNewFriendship(
      parseInt(senderId),
      recipientId,
    );
    return newFriendship;
  }

  @Post('received')
  async getReceived(@Body() userId: number) {
    const demands = await this.friendsService.getReceivedFriendships(userId);
    return demands;
  }

  @Post('friends/')
  async showFriends(@Body() userId: any) {
    const { id } = userId;
    const friends = await this.friendsService.showFriends(id);
    if (friends.friendsOf) {
      return friends.friendsOf;
    }
    return null;
  }
}
