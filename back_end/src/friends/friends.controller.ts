import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/friend.dto';
import { Friend } from './friends.interface';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guards';

@Controller('friends')
@UseGuards(...AuthenticatedGuard)
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

  @Get('blocked/:id/:id1')
  async checkBlocked(@Param('id') id1: string,@Param('id1') id2: string) {
    return this.friendsService.checkBlocked(id1, id2);
  }

  @Get('blockedStatus/:id/:id1')
  async checkBlockedStatus(@Param('id') id1: string,@Param('id1') id2: string) {
    const isBlocked = await this.friendsService.checkBlockedStatus(id1, id2);
    if (isBlocked == true)
    {
      return "BLOCKED"
    }
    return "Add friend";
  }

  @Get('blockedList/:id')
  listBlocked(@Param('id') id: string) {
    const test = this.friendsService.listBlocked(id);
    return test;
  }

  @Get('online/:id')
  listOnliePlayers(@Param('id') id: string, @Req() req: any) {
    const test = this.friendsService.getOnlinePlayers(id);
    return test;
  }

  @Post('accept/:id')
  acceptFriend(@Param('id') id: string, @Req() req: any) {
		console.log("PENDING/////////////////");
		console.log("IN ACCEPT :");
		console.log("id from param = ", id);
		console.log("id from request = ", req.user.id)
    return this.friendsService.acceptRequest(id);
  }

  @Post('refuse/:id')
  refuseFriend(@Param('id') id: string) {
    return this.friendsService.refuseRequest(id);
  }
  
  @Post('delete/:id')
  async deleteFriend(@Req() req:any, @Param('id') id2: string) {
		const id1 = req.user.id.toString();
    return this.friendsService.deleteFriend(id1, id2);
  }

  @Post('block/:id')
  async blockFriend(@Req() req: any,@Param('id') id2: string) {
		const id1 = req.user.id.toString();
    return this.friendsService.blockFriend(id1, id2);
  }

  @Post('unblock/:id')
  async unBlock(@Req() req: any,@Param('id1') id2: string) {
		const id1 = req.user.id.toString();
		console.log("IN UNBLOCK CONTROLLER, id1, id2 =", id1, id2);
// 		PENDING
// 		back      | IN UNBLOCK CONTROLLER, id1, id2 = 97650 undefined
// back      | IN FRONT UNBLOCK //// senderID: 97650
// back      | recipientId =  undefined
// back      | [Nest] 752  - 09/22/2023, 4:54:47 PM   ERROR [ExceptionsHandler] 
// back      | Invalid `prisma.user.update()` invocation in
// back      | /usr/src/app/src/friends/friends.service.ts:60:21
// back      | 
// back      |   57 {
// back      |   58 	console.log("IN FRONT UNBLOCK //// senderID:", senderId);
// back      |   59 	console.log("recipientId = ", recipientId);
// back      | → 60   await prisma.user.update({
// back      |          where: {
// back      |            id: 97650
// back      |          },
// back      |          data: {
// back      |            block: {
// back      |              disconnect: {
// back      |        +       id: Int
// back      |              }
// back      |            }
// back      |          }
// back      |        })
// back      | 
// back      | Argument `id` is missing.
// back      | PrismaClientValidationError: 
// back      | Invalid `prisma.user.update()` invocation in
// back      | /usr/src/app/src/friends/friends.service.ts:60:21
// back      | 
// back      |   57 {
// back      |   58 	console.log("IN FRONT UNBLOCK //// senderID:", senderId);
// back      |   59 	console.log("recipientId = ", recipientId);
// back      | → 60   await prisma.user.update({
// back      |          where: {
// back      |            id: 97650
// back      |          },
// back      |          data: {
// back      |            block: {
// back      |              disconnect: {
// back      |        +       id: Int
// back      |              }
// back      |            }
// back      |          }
// back      |        })
// back      | 
// back      | Argument `id` is missing.
// back      |     at xn (/usr/src/app/node_modules/@prisma/client/runtime/library.js:116:5852)
// back      |     at vn.handleRequestError (/usr/src/app/node_modules/@prisma/client/runtime/library.js:123:6429)
// back      |     at vn.handleAndLogRequestError (/usr/src/app/node_modules/@prisma/client/runtime/library.js:123:6119)
// back      |     at vn.request (/usr/src/app/node_modules/@prisma/client/runtime/library.js:123:5839)
// back      |     at l (/usr/src/app/node_modules/@prisma/client/runtime/library.js:128:9763)
// back      |     at FriendsService.unBlock (/usr/src/app/src/friends/friends.service.ts:60:3)
// back      |     at /usr/src/app/node_modules/@nestjs/core/router/router-execution-context.js:46:28
// back      |     at /usr/src/app/node_modules/@nestjs/core/router/router-proxy.js:9:17
// back      | 

    return this.friendsService.unBlock(id1, id2);
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
    if (statut && statut.status)
      return statut.status;
    return ("not")
  }

  @Get('/already/:id/:id1')
  async checkAlreadyFriend(@Param('id') id: string,@Param('id1') id1: string) {
    const senderId = id;
    const recipientId = id1;
    const statut = await this.friendsService.alreadyFriendGetStatus(senderId, recipientId);
    
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
