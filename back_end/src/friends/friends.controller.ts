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
    const senderId = id;
    const recipientId = id1;
    const amitie = await this.friendsService.sendFriendRequest(senderId, recipientId);
    return amitie;
  }
  
  // @Get('/status/:id/:id1')
  // async getFriendRequest(@Param('id') id: string,@Param('id1') id1: string) {
  //   const senderId = id;
  //   const recipientId = id1;
  //   const statut = await this.friendsService.getfriendrequestStatus(senderId, recipientId);
  //   // const amitie = await this.friendsService.sendFriendRequest(senderId, recipientId);
  //   return statut;
  // }

//   @Post('/update')
//   async updatestatus( request: string) {
//     const reqstatus = await this.friendsService.updatingstatus(request);
//     if (reqstatus.status == ACCEPTED) {
// 			await this.friendsService.addFriend(Request);
//     } else if (reqstatus.status == REFUSED) {
// 			await this.friendsService.deleteFriend(request);
//   }
//   return reqstatus;
// }


}
