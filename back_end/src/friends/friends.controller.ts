import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { UserService } from 'src/user/user.service';
import { Friend } from './friends.interface';
import { Response } from 'express';
import {
  AcceptFriendRequestDto,
  CreateFriendRequestDto,
} from './dto/friend.dto';

@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get('/:id')
  findAll(@Param('id') id: string) {
    return this.friendsService.findAll(id);
  }

  @Post()
  async createFriendRequest(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
  ): Promise<Friend> {
    return this.friendsService.createFriendRequest(createFriendRequestDto);
  }

  @Post('accept')
  async acceptFriendRequest(
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ): Promise<void> {
    await this.friendsService.acceptFriendRequest(acceptFriendRequestDto);
  }

  @Get('status')
  async getFriendshipStatus(
    @Query('senderId') senderId: string,
    @Query('recipientId') recipientId: string,
  ): Promise<string | null> {
    return this.friendsService.getFriendshipStatus(+senderId, +recipientId);
  }
}
