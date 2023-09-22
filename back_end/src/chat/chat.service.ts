import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, privateMessage } from 'src/interfaces';
import { PrismaClient, Chatroom, UserChannelVisibility } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { merge } from 'lodash';
const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  prisma: any;

  async getAllChatRooms(): Promise<Chatroom[]> {
    const chatRooms = await prisma.chatroom.findMany();
    return chatRooms;
  }

  async recupRooms(userId: string): Promise<Chatroom[]> {
    const chatRooms = await prisma.chatroom.findMany({
      where: {
        NOT: {
          users: {
            some: {
              userId: parseInt(userId, 10),
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

  async CreateRoom(nameRoom: string, option: string, hash:string, id: string) {

    console.log("nameRoom: ", nameRoom, "   option: ", option, "   hash: ", hash);
    let visibility: UserChannelVisibility;

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
        hash: hash,
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
  
      console.log(userRooms)
      return userRooms.map((userRoom) => userRoom.channel);
    }

    async JoinRoom(nameRoom: string, option: UserChannelVisibility, hash: string, userId: string): Promise<void> {
      const allChatRooms = await this.getAllChatRooms();
      const chatRoom = allChatRooms.find((room) => room.name === nameRoom);
  
      const existingUserRoom = await prisma.userOnChannel.findFirst({
        where: {
          userId: parseInt(userId, 10),
          channelId: chatRoom.id,
        },
      });
  
      if (existingUserRoom) {
        return ;
      }

      if (chatRoom.visibility == UserChannelVisibility.PWD_PROTECTED)
      {
        if (chatRoom.hash != hash)
          return ;
      }
  
      await prisma.userOnChannel.create({
        data: {
          userId: parseInt(userId, 10),
          channelId: chatRoom.id,
          role: 'USER',
        },
      });
    }
  
  // async fetchAllGames(id: string)
  // {
  //     const ret1 = await prisma.user.findUnique({
  //         where: { id: parseInt(id) },
  //         select: { game1: true },
  //       });
  //       const ret2 = await prisma.user.findUnique({
  //           where: { id: parseInt(id) },
  //           select: { game2: true },
  //       });
  //       if (ret1 && ret2)
  //       {
  //           const ret = merge(ret1, ret2);
  //           const allGames: Game[] = [...ret.game1, ...ret.game2].sort(
  //               (a, b) => Date.parse(a.start_at) - Date.parse(b.start_at)
  //           );
  //       return (allGames);
  //   }
  // }

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

async recupUserNotInChan(roomId: string)
{
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

    const usersNotInChannel = await prisma.user.findMany({
      where: {
        NOT: {
          id: {
            in: userIdsInChannel,
          },
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    return usersNotInChannel.map((user) => ({ id: user.id, username: user.username }));
  } catch (error) {
    console.error('Erreur lors de la récupération des IDs et des usernames des utilisateurs non présents dans la salle de discussion :', error);
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

  // Utilisez Set pour éliminer les doublons des IDs des utilisateurs
  const privateMessageRecipients = new Set(
    user.PrivMessEmited.map((message) => message.recipientId)
  );
  const privateMessageSenders = new Set(
    user.PrivMessReceived.map((message) => message.senderId)
  );

  // Fusionnez les deux ensembles pour obtenir toutes les IDs des utilisateurs avec qui l'utilisateur a eu des messages privés
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

  return userRole.role;
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

}