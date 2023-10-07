import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, privateMessage } from 'src/interfaces';
import { PrismaClient,UserRoleInChannel, Chatroom, UserChannelVisibility, InvitationsStatus } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { merge } from 'lodash';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  prisma: any;

  async getAllChatRooms(){
    const chatRooms = await prisma.chatroom.findMany();
    return chatRooms;
  }

  async recupRooms(userId: string){
    const chatRooms = await prisma.chatroom.findMany({
      where: {
        NOT: {
          users: {
            some: {
              userId: parseInt(userId),
            },
          },
        },
        visibility: {
          not: UserChannelVisibility.PRIVATE,
        },
      },
    });
    return chatRooms;
  }

  async getAllChatRoomNames(): Promise<string[]> {
    const chatRooms = await prisma.chatroom.findMany({
      select: {
        name: true,
      },
    });

    return chatRooms.map((chatRoom) => chatRoom.name);
  }


  async CreateMessage(newMessage: string, id1: string, id2:string) {
    if (id1 && id2)
    {
      try {
        const p1 = await prisma.user.findUnique({
          where: {
            id: parseInt(id1),
          },
        });
        const p2 = await prisma.user.findUnique({
          where: {
            id: parseInt(id2),
          },
        });
        const createdMessage = await prisma.privateMessage.create({
          data: {
            content: newMessage,
            sender: {
              connect: {
                id: p1.id,
                email: p1.email,
                username: p1.username
              }
            },
            recipient: {
              connect: {
                id: p2.id,
                email: p2.email,
                username: p2.username
              }

              }
            }
        });
        return createdMessage;
      }
       catch (err) {
        console.log('Error creating game:', err);
        throw err;
      }
    } 
  }

  async CreateMessageRoom(newMessage: string, sender: string, roomId:string) {
      try {
        const p1 = await prisma.user.findUnique({
          where: {
            id: parseInt(sender),
          },
        });
        const p2 = await prisma.user.findUnique({
          where: {
            id: parseInt(roomId),
          },
        });
        const createdMessage = await prisma.chatroomMessage.create({
          data: {
            content: newMessage,
            sender: {
              connect: {
                id: p1.id,
                email: p1.email,
                username: p1.username
              }
            },
            chatroom: {
              connect: {
                id: parseInt(roomId)
              }
            }
          }
        });
        return createdMessage;
      }
       catch (err) {
        console.log('Error creating chatmess:', err);
        throw err;
      }
  }

  async passwordHasher(input: string){
		if (!input)
			return ;
		const saltOrRounds = 10;
		const hash = await bcrypt.hash(input, saltOrRounds);
		return hash.toString();
	}

  async CreateRoom(nameRoom: string, option: string, hash:string, id: string) {

    let visibility: UserChannelVisibility;
		let securedHash = await this.passwordHasher(hash.toString());

    if (option == "public")
      visibility = UserChannelVisibility.PUBLIC;
    if (option == "private")
      visibility = UserChannelVisibility.PRIVATE;
    if (option == "protected")
      visibility = UserChannelVisibility.PWD_PROTECTED;
    const newChannel = await prisma.chatroom.create({
      data: {
        name: nameRoom,
        visibility: visibility,
        hash: securedHash,
      },
    });
    const userOnChannel = await prisma.userOnChannel.create({
      data: {
        channelId: newChannel.id,
        userId: parseInt(id),
        role: "OWNER"
      }
    });
    return newChannel;
  }

  async checkRoomExist(nameRoom: string) {

    const roomNames = await this.getAllChatRoomNames();
    return roomNames.includes(nameRoom);
  }

  async checkIfIn(nameRoom: string, userId: string) {

      const rooms = await this.getAllChatRooms();
      const room = rooms.find((room) => room.name === nameRoom);
      const users = await prisma.chatroom.findUnique({
        where: {
          id: room.id,
        },
        select: {
          users: true
        }
      })
      const userInRoom = users.users.find((user) => user.userId === parseInt(userId));
      if (userInRoom)
        return (true);
      else
        return (false);
  }

    async recupYourRooms(userId: string) {
      
      const userRooms = await prisma.userOnChannel.findMany({
        where: {
          userId: parseInt(userId),
        },
        select: {
          channel: {
            select: {
              id: true,
              name: true,
              visibility: true,
            },
          },
        },
      });
  
      return userRooms.map((userRoom) => userRoom.channel);
    }

    

    async JoinRoom(nameRoom: string, option: UserChannelVisibility, hash: string, userId: string): Promise<void> {
      const allChatRooms = await this.getAllChatRooms();
      const chatRoom = allChatRooms.find((room) => room.name === nameRoom);
    
      const existingUserRoom = await prisma.userOnChannel.findFirst({
        where: {
          userId: parseInt(userId),
          channelId: chatRoom.id,
        },
      });
    
      if (existingUserRoom) {
        return;
      }
    
      if (chatRoom.visibility == UserChannelVisibility.PWD_PROTECTED) {
				if (await bcrypt.compare(hash, chatRoom.hash) === false){
          return;
        }
      }
    
      const pendingInvitation = await prisma.chatroomInvitations.findFirst({
        where: {
          receiverId: parseInt(userId),
          chatroomId: chatRoom.id,
          status: InvitationsStatus.PENDING,
        },
      });
    
      if (pendingInvitation) {
        await prisma.chatroomInvitations.delete({
          where: {
            id: pendingInvitation.id,
          },
        });
      }
    
      await prisma.userOnChannel.create({
        data: {
          userId: parseInt(userId),
          channelId: chatRoom.id,
          role: 'USER',
        },
      });
    }
    
  

async recupMessById(recipient:string, sender:string)
{
  const ret1 = await prisma.user.findUnique({
    where: {
      id: parseInt(sender),
    },
    include: { PrivMessEmited: {
    where: {
      recipientId:parseInt(recipient),
    }}
}});
const ret2 = await prisma.user.findUnique({
  where: {
    id: parseInt(sender),
  },
  include: { PrivMessReceived: {
  where: {
    senderId:parseInt(recipient),
  }}
}});
      if (ret1 && ret2)
        {
            const ret = merge(ret1, ret2);
            const allGames: privateMessage[] = [...ret.PrivMessEmited, ...ret.PrivMessReceived].sort(
                (a, b) => Date.parse(a.start_at) - Date.parse(b.start_at)
            );
        return (allGames);
}
}

async recupRoomMess(roomId:string)
{
  const ret1 = await prisma.chatroom.findUnique({
    where: {
      id: parseInt(roomId),
    },
    select: {
      roomMess : true,
    }
});

      if (ret1)
        {
            const ret = merge(ret1);
            const allGames: privateMessage[] = [...ret.roomMess].sort(
                (a, b) => Date.parse(a.start_at) - Date.parse(b.start_at)
            );
        return (allGames);
}
}

async  recupUserNotInChan(roomId: string, userId: string) {
  try {
    const usersInChannel = await prisma.userOnChannel.findMany({
      where: {
        channelId: parseInt(roomId),
      },
      select: {
        userId: true,
      },
    });

    const userIdsInChannel = usersInChannel.map((user) => user.userId);

    const invitations = await prisma.chatroomInvitations.findMany({
      where: {
        chatroomId: parseInt(roomId),
        receiverId: parseInt(userId),
      },
      select: {
        senderId: true,
      },
    });

    const userIdsWithInvitations = invitations.map((invitation) => invitation.senderId);

    const usersNotInChannelOrWithInvitations = await prisma.user.findMany({
      where: {
        NOT: {
          id: {
            in: [...userIdsInChannel, ...userIdsWithInvitations],
          },
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    return usersNotInChannelOrWithInvitations.map((user) => ({ id: user.id, username: user.username }));
  } catch (error) {
    console.error('Erreur lors de la récupération des IDs et des usernames des utilisateurs non présents dans la salle de discussion ou avec des invitations en attente :', error);
    throw error;
  }
}




async recupPrivate(userId: string){
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
    include: {
      PrivMessEmited: {
        select: {
          recipientId: true,
        },
      },
      PrivMessReceived: {
        select: {
          senderId: true,
        },
      },
    },
  });

  const privateMessageRecipients = new Set(
    user.PrivMessEmited.map((message) => message.recipientId)
  );
  const privateMessageSenders = new Set(
    user.PrivMessReceived.map((message) => message.senderId)
  );

  const privateMessageUsers = new Set([
    ...privateMessageRecipients,
    ...privateMessageSenders,
  ]);
  return Array.from(privateMessageUsers);}

async getRole(senderId: string, roomId: string) {

  const userRole = await prisma.userOnChannel.findFirst({
    where: {
      userId: parseInt(senderId),
      channelId: parseInt(roomId),
    },
    select: {
      role: true,
    },
  });
  if (userRole)
    return userRole.role;
}

async getUsersInRoomForList(roomId: string) {
  const usersInRoom = await prisma.userOnChannel.findMany({
    where: {
      channelId: parseInt(roomId),
    },
    select: {
      userId: true,
      role: true, 
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return usersInRoom.map((user) => ({
    id: user.userId,
    username: user.user.username,
    role: user.role,
  }));
}



async getUsersInRoom(roomId: string): Promise<number[]> {
  const usersInRoom = await prisma.userOnChannel.findMany({
    where: {
      channelId: parseInt(roomId),
    },
    select: {
      userId: true,
    },
  });

  return usersInRoom.map((user) => user.userId);
}

async recupInvSend(senderId: string, roomId: string) {
  try {
    const invitations = await prisma.chatroomInvitations.findMany({
      where: {
        senderId: parseInt(senderId),
        chatroomId: parseInt(roomId),
      },
    });

    return invitations
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations envoyées :', error);
    throw error;
  }
}

async recupInvReceive(userId: string) {
  try {
    const invitations = await prisma.chatroomInvitations.findMany({
      where: {
        receiverId: parseInt(userId),
      },
    });

    return invitations;
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations reçues :', error);
    throw error;
  }
}

async getRoomName(id: string) {
  const room = await prisma.chatroom.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      name: true,
    },
  });

  if (room)
    return room.name;
  return null;
}


async createInvite(senderId: string, recipientId: string, roomId: string): Promise<void> {
  try {
    // Vérifiez si une invitation similaire existe déjà
    const existingInvitation = await prisma.chatroomInvitations.findFirst({
      where: {
        chatroomId: parseInt(roomId),
        senderId: parseInt(senderId),
        receiverId: parseInt(recipientId),
        status: InvitationsStatus.PENDING,
      },
    });

    if (!existingInvitation) {
      // Si aucune invitation similaire n'existe, créez une invitation
      await prisma.chatroomInvitations.create({
        data: {
          chatroomId: parseInt(roomId),
          senderId: parseInt(senderId),
          receiverId: parseInt(recipientId),
          status: InvitationsStatus.PENDING,
        },
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'invitation :', error);
    throw error;
  }
}

async refuseInvite(id: string)
{
  const recup = await prisma.chatroomInvitations.findUnique({
    where: {
      id: parseInt(id),
    }
  })

  if (!recup)
    return ;
  
  const friendShipUpdate = await prisma.chatroomInvitations.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status: InvitationsStatus.REJECTED,
    },
  })
  const friendShip = await prisma.chatroomInvitations.delete({
    where: {
      id: parseInt(id),
    },
  })
  
}

async leftChan(roomId: string, userId: string)
{
  await prisma.userOnChannel.deleteMany({
    where: {
      channelId: parseInt(roomId),
      userId: parseInt(userId),
    },
  });
}

async passAdmin(roomId: string, userId: string)
{
  await prisma.userOnChannel.updateMany({
    where: {
      channelId: parseInt(roomId),
      userId: parseInt(userId),
    },
    data: {
      role: UserRoleInChannel.ADMIN
    }
  });
}

async demoteAdmin(roomId: string, userId: string)
{
  await prisma.userOnChannel.updateMany({
    where: {
      channelId: parseInt(roomId),
      userId: parseInt(userId),
    },
    data: {
      role: UserRoleInChannel.USER
    }
  });
}

async banSomeone(roomId: string, userId: string, time: number)
{
  const bannedUntil = new Date();
  let timeAsNumber = parseInt(time.toString(), 10);
  let minutes = bannedUntil.getMinutes();
  minutes += timeAsNumber;
  bannedUntil.setMinutes(minutes);

  await prisma.userOnChannel.updateMany({
    where: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
    },
    data: {
      bannedUntil : bannedUntil,
    },
  });
}

async muteSomeone(roomId: string, userId: string, time: number)
{
  const mutedUntil = new Date();
  let timeAsNumber = parseInt(time.toString(), 10);
  let minutes = mutedUntil.getMinutes();
  minutes += timeAsNumber;
  mutedUntil.setMinutes(minutes);

  await prisma.userOnChannel.updateMany({
    where: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
    },
    data: {
      mutedUntil : mutedUntil,
    },
  });
}

async unMuteSomeone(roomId: string, userId: string)
{
  await prisma.userOnChannel.updateMany({
    where: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
    },
    data: {
      mutedUntil : null,
    },
  });
}

async unBanSomeone(roomId: string, userId: string)
{
  await prisma.userOnChannel.updateMany({
    where: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
    },
    data: {
      bannedUntil : null,
    },
  });
}



async banUserTemporarily(roomId: string, userId: string, time: number){
  const bannedUntil = new Date();
  bannedUntil.setMinutes(bannedUntil.getMinutes() + time);

  await prisma.userOnChannel.updateMany({
    where: {
      channelId: parseInt(roomId),
      userId: parseInt(userId),
    },
    data: {
      bannedUntil : bannedUntil,
    },
  });
}

async getStatusMute(userId: string, roomId: string) {
  const userOnChannel = await prisma.userOnChannel.findUnique({
    where: {
      channelId_userId: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
      },
    },
  });

  if (userOnChannel) {
    if (userOnChannel.mutedUntil && new Date() < userOnChannel.mutedUntil) {
      return "true";
    }
  }
  return "false";
}

async getStatusBan(userId: string, roomId: string) {
  const userOnChannel = await prisma.userOnChannel.findUnique({
    where: {
      channelId_userId: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
      },
    },
  });

  if (userOnChannel) {
    if (userOnChannel.bannedUntil && new Date() < userOnChannel.bannedUntil) {
      return "true";
    }
  }
  return "false";
}

async getStatusChan(roomId: string) {
  const room = await prisma.chatroom.findUnique({
    where: {
      id: parseInt(roomId),
    },
  });
  if (room)
    return (room.visibility);
}

async timeLeftMuteUser(userId: string, roomId: string) {
  const userOnChannel = await prisma.userOnChannel.findUnique({
    where: {
      channelId_userId: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
      },
    },
  });
  
  if (!userOnChannel)
    return ;
  const now = new Date();
  const mutedUntil = new Date(userOnChannel.mutedUntil).getTime();
  const differenceInMs = mutedUntil - now.getTime();
  const differenceInSeconds = Math.floor(differenceInMs / 1000);

  return differenceInSeconds;
}

async timeLeftBanUser(userId: string, roomId: string) {
  const userOnChannel = await prisma.userOnChannel.findUnique({
    where: {
      channelId_userId: {
        channelId: parseInt(roomId),
        userId: parseInt(userId),
      },
    },
  });
  const now = new Date();
  const bannedUntil = new Date(userOnChannel.bannedUntil).getTime();
  const differenceInMs = bannedUntil - now.getTime();
  const differenceInSeconds = Math.floor(differenceInMs / 1000);

  return differenceInSeconds;
}





async changeStatut(roomId: string, option: string, pass: string) {

  let visibility: UserChannelVisibility;
  let securedHash = await this.passwordHasher(pass.toString());
  
  if (option == "PUBLIC")
    visibility = UserChannelVisibility.PUBLIC;
  if (option == "PRIVATE")
    visibility = UserChannelVisibility.PRIVATE;
  if (option == "PWD_PROTECTED")
    visibility = UserChannelVisibility.PWD_PROTECTED;
  const room = await prisma.chatroom.update({
    where: {
      id: parseInt(roomId),
    },
    data: {
      visibility: visibility,
      hash: securedHash,
    }
  });
  if (room)
    return (room.visibility);
}

}