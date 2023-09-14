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

  @Get('invSend/:id')
  invSend(@Param('id') id: string) {
    return this.friendsService.findInvSend(id);
  }

  @Get('invRequest/:id')
  invRequest(@Param('id') id: string) {
    return this.friendsService.findInvRequest(id);
  }

  @Post('accept/:id')
  acceptFriend(@Param('id') id: string) {
    return this.friendsService.acceptRequest(id);
  }

  @Post('refuse/:id')
  refuseFriend(@Param('id') id: string) {
    return this.friendsService.refuseRequest(id);
  }
  
  @Post('delete/:id/:id1')
  async deleteFriend(@Param('id') id1: string,@Param('id1') id2: string) {
    return this.friendsService.deleteFriend(id1, id2);
  }

  @Post('/:id/:id1')
  async createFriendRequest(@Param('id') id: string,@Param('id1') id1: string) {
    const senderId = id;
    const recipientId = id1;
    const amitie = await this.friendsService.sendFriendRequest(senderId, recipientId);
    return amitie;
  }
  
  @Get('/status/:id/:id1')
  async getFriendRequest(@Param('id') id: string,@Param('id1') id1: string) {
    const senderId = id;
    const recipientId = id1;
    const statut = await this.friendsService.getfriendrequestStatus(senderId, recipientId);
    
    // const amitie = await this.friendsService.sendFriendRequest(senderId, recipientId);
    if (statut)
      return statut.status;
    return ("not")
  }

  @Get('/already/:id/:id1')
  async checkAlreadyFriend(@Param('id') id: string,@Param('id1') id1: string) {
    const senderId = id;
    const recipientId = id1;
    const statut = await this.friendsService.alreadyFriendGetStatus(senderId, recipientId);
    
    console.log(statut);
    // const amitie = await this.friendsService.sendFriendRequest(senderId, recipientId);
    if (statut != 0)
      return "ACCEPTED";
    return "Add friend";
    }

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
