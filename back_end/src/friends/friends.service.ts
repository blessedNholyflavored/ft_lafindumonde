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

  async sendFriendRequest(
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
}
