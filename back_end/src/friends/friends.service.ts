import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
// import { Friend } from './types/friends';
import { Friend } from './friends.interface';
import {
  AcceptFriendRequestDto,
  CreateFriendRequestDto,
} from './dto/friend.dto';
import { FriendsInvitationStatus } from './interfaces/friends.interface';

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

  async addFriend(request: any) {
    const { senderId, recipientId } = request;
    const sender = await this.userService.getID(parseInt(senderId));
    const recipient = await this.userService.getID(parseInt(recipientId));
    await this.userService.addFriendOnTable(sender.id, recipient.id);
    await this.userService.addFriendOnTable(recipient.id, sender.id);
  }
  // async showFriends(id: string) {
  //   // const { id } = userId;
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id: parseInt(id) },
  //       include: { friends: true, friendsOf: true },
  //     });
  //     return user;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  async createFriendRequest(
    createFriendRequestDto: CreateFriendRequestDto,
  ): Promise<Friend> {
    const { senderId, recipientId } = createFriendRequestDto;

    const existingFriendship = await this.prisma.friendship.findUnique({
      where: {
        senderId_recipientId: {
          senderId,
          recipientId,
        },
      },
    });
    if (existingFriendship) {
      throw new Error('Friendship request already exists');
    }
    const newFriendRequest: Friend = await this.prisma.friendship.create({
      data: {
        sender: {
          connect: {
            id: senderId,
          },
        },
        recipient: {
          connect: {
            id: recipientId,
          },
        },
        status: 'PENDING',
      },
    });

    return newFriendRequest;
  }

  async acceptFriendRequest(
    acceptFriendRequestDto: AcceptFriendRequestDto,
  ): Promise<void> {
    const { senderId, recipientId } = acceptFriendRequestDto;

    await this.prisma.friendship.update({
      where: {
        senderId_recipientId: {
          senderId,
          recipientId,
        },
      },
      data: {
        status: 'ACCEPTED',
      },
    });
  }

  async updateFriendshipStatus(
    senderId: number,
    recipientId: number,
    newStatus: FriendsInvitationStatus,
  ): Promise<void> {
    await this.prisma.friendship.update({
      where: {
        senderId_recipientId: {
          senderId,
          recipientId,
        },
      },
      data: {
        status: newStatus,
      },
    });
  }

  async getFriendshipStatus(
    senderId: number,
    recipientId: number,
  ): Promise<string | null> {
    const friendship = await this.prisma.friendship.findUnique({
      where: {
        senderId_recipientId: {
          senderId,
          recipientId,
        },
      },
    });
    return friendship ? friendship.status : null;
  }
}
