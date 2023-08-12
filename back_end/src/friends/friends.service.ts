import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
// import { Friend } from './types/friends';

const prisma = new PrismaClient();

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
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
      console.error(error);
    }
  }

  async showFriends(id: string) {
    // const { id } = userId;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { friends: true, friendsOf: true },
      });
      return user;
    } catch (error) {
      console.error(error);
    }
  }

  async addNewFriendship(senderId: number, recipientId: number) {
    const friendship = await this.prisma.friendship.create({
      data: {
        senderId: senderId,
        recipientId: recipientId,
      },
    });
    return friendship;
  }

  async getReceivedFriendships(userId: any) {
    const { id } = userId;
    try {
      const user = await this.userService.getID(parseInt(id));
      const demands = await this.prisma.friendship.findMany({
        where: {
          recipientId: user.id,
        },
        include: {
          sender: true,
        },
      });
      return demands;
    } catch (error) {
      throw new BadRequestException('getReceivedFriendships error : ' + error);
    }
  }

  async updateFriendship(id: any) {
    const { demandId, response } = id;
    const friendhip = await this.prisma.friendship.update({
      where: {
        id: parseInt(demandId),
      },
      data: {
        status: response,
      },
    });
    return friendhip;
  }
}
