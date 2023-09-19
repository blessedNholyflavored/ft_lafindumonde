import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, privateMessage } from 'src/interfaces';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { merge } from 'lodash';
const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  prisma: any;

  async CreateMessage(newMessage: string, id1:string, id2:string) {
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
}