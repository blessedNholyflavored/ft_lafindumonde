import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateFriendRequestDto } from './dto/friend.dto';
import { Friend } from './friends.interface';

const prisma = new PrismaClient();

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async findAll(id: string) {
    // const { id } = userId;
    try {
      const friends = await this.prisma.user.findMany({
        where: { id: parseInt(id) },
        include: { friends: true, friendsOf: true },
      });
      return friends;
    } catch (error) {
      throw new BadRequestException('getfriends error : ' + error);
    }
  }

  async sendFriendRequest(senderId: string, recipientId: string)
    {
    const p1 = await prisma.user.findUnique({
      where: {
        id: parseInt(senderId),
      },
    });
    const p2 = await prisma.user.findUnique({
      where: {
        id: parseInt(recipientId),
      },
    });

    const newFriendRequest = await this.prisma.friendship.create({
      data: {
        sender: {
          connect: {
            id: parseInt(senderId),
            email: p1.email,
            username: p1.username
          },
        },
        recipient: {
          connect: {
            id: parseInt(recipientId),
            email: p2.email,
            username: p2.username
          },
        },
        status: 'PENDING',
      },
    });

    return newFriendRequest;
  }

  // async getfriendrequestStatus(sender: string, recipient: string)
  // { 

  //   const p1 = await prisma.user.findUnique({
  //     where: {
  //       id: parseInt(sender),
  //     },
  //   });
  //   const p2 = await prisma.user.findUnique({
  //     where: {
  //       id: parseInt(recipient),
  //     },
  //   });

  //   console.log("ipoejfoiewjfjwe", p1.InvitFriendSent.status)
  //   const test  = await this.prisma.friendship.findUnique({
  //     where: {
  //         // sender : p1,
  //         id : 5
  //     },
  //   });
  //   if (test) {
  //     throw new Error('Friendship request already exists');
  //   }
  // }

  // async updatingstatus(id: any) {
		// const { demandId, response } = id
		// const friendship = await this.prisma.friendship.update({
			// where: {
				// id: parseInt(demandId),
			// },
			// data: {
				// status: response,
			// },
		// });
		// return friendship;
	// }

    // async addFriend(request: any) {
    // 	const { requesterId, receiverId } = request;
    // 	const sender = await this.userService.getUser(parseInt(senderId));
    // 	const recipient = await this.userService.getUser(parseInt(recipientId));
    // 	// await this.userService.addFriendOnTable(requester.id, receiver.id)
    // 	// await this.userService.addFriendOnTable(receiver.id, requester.id)
    // 	// await this.userService.updateAchievement(requester.id, 'Famous')
    // 	// await this.userService.updateAchievement(receiver.id, 'Famous')
    // }

  // async deleteFriend() {
	// 	await this.prisma.friendship.deleteMany({
	// 		where: { status: 'REFUSED'},
	// 	});
	// }

}