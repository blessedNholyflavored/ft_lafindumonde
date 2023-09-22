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

  async findInvSend(id: string) {
    try {
      const friends = await this.prisma.user.findMany({
        where: { id: parseInt(id) },
        select: { InvitFriendSent: true},
      });
      return friends[0].InvitFriendSent;
    } catch (error) {
      throw new BadRequestException('invsend recup friends error : ' + error);
    }
  }


  async findInvRequest(id: string) {
    try {
      const friends = await this.prisma.user.findMany({
        where: { id: parseInt(id) },
        select: { InvitFriendReceived: true},
      });
      return friends[0].InvitFriendReceived;
    } catch (error) {
      throw new BadRequestException('invsend recup friends error : ' + error);
    }
  }


async unBlock(senderId: string, recipientId: string)
{
  await prisma.user.update({
    where: {
      id: parseInt(senderId),
    },
    data: {
      block: {
        disconnect: {
          id: parseInt(recipientId),
        },
      },
    },
  });

  await prisma.user.update({
    where: {
      id: parseInt(recipientId),
    },
    data: {
      blockOf: {
        disconnect: {
          id: parseInt(senderId),
        },
      },
    },
  });
}

async blockFriend(sender: string, recipient: string)
{
  const updateUser = await prisma.user.update({
    where: {
      id: parseInt(sender),
    },
    include: { block: true },
    data: {
      block: { connect: { id: parseInt(recipient) } },
    },
  });
  const updateUser1 = await prisma.user.update({
    where: {
      id: parseInt(recipient),
    },
    include: { blockOf: true },
    data: {
      blockOf: { connect: { id: parseInt(sender) } },
    },
  });
}

async listBlocked(id: string)
{
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        block: true,
      },
    });

    if (user) {
      const blockedUsers = user.block;
      return blockedUsers;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs bloqués : ', error);
    throw error;
  }
}

async checkBlocked(senderId: string, recipientId: string)
{
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(recipientId),
      },
      include: {
        block: true,
      },
    });

    if (user) {
      const blockedUsers = user.block;

      const isBlocked = blockedUsers.some((blockedUser) => blockedUser.id === parseInt(senderId));
      return isBlocked;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du blocage de l'utilisateur : ", error);
    throw error;
  }
}

async getOnlinePlayers(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        friends: true,
        block: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const usersOnline = await prisma.user.findMany({
      where: {
        status: 'ONLINE',
      },
    });

    const usersOnlineFiltered = usersOnline.filter((onlineUser) => {
      const isFriend = user.friends.some((friend) => friend.id === onlineUser.id);
      const isBlocked = user.block.some((blockedUser) => blockedUser.id === onlineUser.id);
      const isUser = user.id === onlineUser.id;

      return !isFriend && !isBlocked && !isUser;
    });

    return usersOnlineFiltered;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des utilisateurs en ligne: ${error.message}`);
  }
}

async checkBlockedStatus(senderId: string, recipientId: string)
{
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(recipientId),
      },
      include: {
        block: true,
      },
    });

    if (user) {
      const blockedUsers = user.block;

      const isBlocked = blockedUsers.some((blockedUser) => blockedUser.id === parseInt(senderId));
      return isBlocked;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du blocage de l'utilisateur : ", error);
    throw error;
  }
}


async deleteFriend(sender: string, recipient: string)
{

  const user1 = await this.prisma.user.findUnique({
    where: {
      id: parseInt(sender),
    },
  });

  const user2 = await this.prisma.user.findUnique({
    where: {
      id: parseInt(recipient),
    },
  });

  await this.prisma.user.update({
    where: {
      id: parseInt(sender),
    },
    data: {
      friends: {
        disconnect: {
          id: parseInt(recipient),
        },
      },
    },
  });
  await this.prisma.user.update({
    where: {
      id: parseInt(recipient),
    },
    data: {
      friends: {
        disconnect: {
          id: parseInt(sender),
        },
      },
    },
  });

  await this.prisma.user.update({
    where: {
      id: parseInt(recipient),
    },
    data: {
      friendsOf: {
        disconnect: {
          id: parseInt(sender),
        },
      },
    },
  });
  await this.prisma.user.update({
    where: {
      id: parseInt(sender),
    },
    data: {
      friendsOf: {
        disconnect: {
          id: parseInt(recipient),
        },
      },
    },
  });
}

  async acceptRequest(id: string)
  {

    const friendShip = await prisma.friendship.findUnique({
      where: {
        id: parseInt(id),
      },
    })
    
    this.userService.addFriends(friendShip.senderId, friendShip.recipientId);
    const friendShipUpdate = await prisma.friendship.delete({
      where: {
        id: parseInt(id),
      },
    })
  }

  async refuseRequest(id: string)
  {
    const friendShipUpdate = await prisma.friendship.update({
      where: {
        id: parseInt(id),
      },
      data: {
			  status: "REFUSED",
			},
    })
    const friendShip = await prisma.friendship.delete({
      where: {
        id: parseInt(id),
      },
    })
    
   // this.userService.addFriends(friendShip.senderId, friendShip.recipientId);
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
  
  
  async alreadyFriendGetStatus(sender: string, recipient: string)
  { 
    const friendslist = await prisma.user.findUnique({
      where: {
        id: parseInt(sender),
      },
      select: { friends: true
      },
    })

    if (friendslist) {
      // Recherche de l'index de l'élément correspondant
      const index = friendslist.friends.findIndex((friend) => {
        return friend.id === parseInt(recipient);
      });
      if (index <= -1)
      {
        return 0;
      }
    }
    return 1;
  }

  async getfriendrequestStatus(sender: string, recipient: string)
  { 

    const p1 = await prisma.user.findUnique({
      where: {
        id: parseInt(sender),
      },
      include: {
        InvitFriendSent : true,
      }
    });
    const p2 = await prisma.user.findUnique({
      where: {
        id: parseInt(recipient),
      },
    });



    // console.log(p1.InviFriendSent);


    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        AND: [
          {
            senderId: p1.id,
          },
          {
            recipientId: p2.id,
          },
        ],
      },
    });

    if (existingFriendship)
      return  existingFriendship;
    else
      return null;
  }

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