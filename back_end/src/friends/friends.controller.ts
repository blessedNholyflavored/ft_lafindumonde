import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { UserService } from 'src/user/user.service';
import { Friend } from './types/friends';
import { Response } from 'express';

@Controller('friends')
export class FriendsController {
  constructor(
    private friendsService: FriendsService,
    private userService: UserService,
  ) {}

  @Get('/:id')
  findAll(@Param('id') id: string) {
    return this.friendsService.findAll(id);
  }

  @Post('/')
  async addFriends(@Body() usersId: any) {
    const { senderId, recipientId } = usersId;
    const newFriendship = await this.friendsService.openFriendship(
      parseInt(senderId),
      recipientId,
    );
    console.log('hello');
    return newFriendship;
  }

  // @Post()
  // create(@Res() res: Response) {
  //   res.status(HttpStatus.CREATED).send();
  // }
}
