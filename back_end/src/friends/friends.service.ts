import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Friend } from './types/friends';

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

  async openFriendship(requesterId: number, receiverId: number) {
    const friendship = await this.prisma.Friends.create({
      data: {
        requesterId: requesterId,
        receiverId: receiverId,
      },
    });
    return friendship;
  }

  // async getFriendsInvitationStatus(senderId: number, recipientId: number) {
  //   try {
  //     const friendstatus = await this.prisma.Friends.findUnique({
  //       where: {
  //         senderId_recipientId: {
  //           senderId,
  //           recipientId,
  //         },
  //       },
  //       select: {
  //         status: true,
  //       },
  //     });
  //     console.log('lol');
  //     return friendstatus?.status ?? null;
  //   } catch (error) {
  //     console.error('Error getting FriendsInvitationStatus:', error);
  //     throw error;
  //   }
  // }
}
