import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from 'src/interfaces';
import { PrismaClient, Game } from '@prisma/client';
import { UserService } from 'src/user/user.service';

const prisma = new PrismaClient();

@Injectable()
export class GameService {
  prisma: any;


  
  async CreateGame(id1: number, id2: number): Promise<Game> {
    if (id1 && id2)
    {
      try {
        const p1 = await prisma.user.findUnique({
          where: {
            id: id1,
          },
        });
        const p2 = await prisma.user.findUnique({
          where: {
            id: id2,
          },
        });
        const createdGame = await prisma.game.create({
          data: {
            roomId: 0,
            start_at: new Date(),
            end_at: new Date(),
            player1: {
              connect: {
                id: p1.id,
                email: p1.email,
                username: p1.username
              }
            },
            player2: {
              connect: {
                id: p2.id,
                email: p2.email,
                username: p2.username
              }

              }
            }
        });
        return createdGame;
      }
       catch (err) {
        console.log('Error creating game:', err);
        throw err;
      }
    } 
  }


  async updateGame(room: Room){

    const updateUser = await prisma.game.update({
      where: { id: room.idRoom },
      data: {
        winnerId: room.winnerid,
        scrP1: room.scorePlayer1,
        scrP2: room.scorePlayer2,
        end_at: new Date(),
        roomId: room.idRoom
      },
    });  
}


async getGameByID(id: number): Promise<Game | undefined> {
  return await prisma.game.findUnique({
    where: {
      id,
    },
  });
}
}
